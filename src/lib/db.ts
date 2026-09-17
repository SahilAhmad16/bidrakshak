import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from './models/User';
import Tender from './models/Tender';
import Verification from './models/Verification';
import { extractTenderRequirements } from './analysis-engine';
import {
  TenderRecord,
  TenderRequirement,
  VerificationReport,
  VerificationFeedback,
  DashboardMetrics,
  DocumentItem,
} from '@/types';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return false;
  }

  if (cached.conn) {
    return true;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return true;
  } catch (err) {
    cached.promise = null;
    console.warn('[Database] MongoDB connection attempt failed, using local resilient store:', err);
    return false;
  }
}

// Resilient persistent local storage for zero-config development
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'bidrakshak-store.json');

interface StoredUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface StoredTender {
  _id: string;
  id: string;
  title: string;
  organization: string;
  tenderReference: string;
  documentRef: string;
  extractedText: string;
  userId: string;
  status: 'Completed' | 'Processing' | 'Failed';
  requirements: TenderRequirement[];
  documents?: DocumentItem[];
  createdAt: string;
  updatedAt?: string;
  // Legacy fields
  bidDocumentRef?: string;
  bidExtractedText?: string;
  verificationType?: string;
}

interface StoredVerification extends VerificationReport {
  _id?: string;
  userId: string;
}

interface LocalStore {
  users: StoredUser[];
  tenders: StoredTender[];
  verifications: StoredVerification[];
  analyses?: any[];
}

function ensureDataFile(): LocalStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let store: LocalStore;
  if (!fs.existsSync(DATA_FILE)) {
    store = { users: [], tenders: [], verifications: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return store;
  }

  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    store = JSON.parse(content);
    if (!store.users) store.users = [];
    if (!store.tenders) store.tenders = [];
    if (!store.verifications) store.verifications = [];
  } catch {
    store = { users: [], tenders: [], verifications: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return store;
  }

  // Graceful migration: Ensure all existing tenders have requirements populated
  let migrated = false;
  for (const t of store.tenders) {
    if (!t.requirements || t.requirements.length === 0) {
      t.requirements = extractTenderRequirements(t.extractedText || '', {
        title: t.title,
        organization: t.organization,
        tenderReference: t.tenderReference,
      });
      if (!t.tenderReference) {
        t.tenderReference = 'TND-REF-' + t.id.slice(-6).toUpperCase();
      }
      migrated = true;
    }
  }

  if (migrated) {
    writeDataFile(store);
  }

  return store;
}

function writeDataFile(store: LocalStore) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export const dbStore = {
  /* ── User Auth Methods ── */
  async findUserByEmail(email: string) {
    const isConnected = await connectToDatabase();
    const cleanEmail = email.toLowerCase().trim();
    if (isConnected) {
      const user = await User.findOne({ email: cleanEmail }).lean();
      if (!user) return null;
      return {
        id: (user as any)._id.toString(),
        name: (user as any).name,
        email: (user as any).email,
        passwordHash: (user as any).passwordHash,
        createdAt: (user as any).createdAt,
      };
    }
    const store = ensureDataFile();
    const found = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    return found ? { ...found, id: found._id || found.id } : null;
  },

  async findUserById(id: string) {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const user = await User.findById(id).lean();
      if (!user) return null;
      return {
        id: (user as any)._id.toString(),
        name: (user as any).name,
        email: (user as any).email,
        createdAt: (user as any).createdAt,
      };
    }
    const store = ensureDataFile();
    const found = store.users.find((u) => u.id === id || u._id === id);
    if (!found) return null;
    return {
      id: found.id || found._id,
      name: found.name,
      email: found.email,
      createdAt: found.createdAt,
    };
  },

  async createUser(data: { name: string; email: string; passwordHash: string }) {
    const isConnected = await connectToDatabase();
    const cleanEmail = data.email.toLowerCase().trim();
    if (isConnected) {
      const doc = await User.create({
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash: data.passwordHash,
      });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        createdAt: doc.createdAt.toISOString(),
      };
    }
    const store = ensureDataFile();
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newUser: StoredUser = {
      _id: id,
      id,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: data.passwordHash,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    writeDataFile(store);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  },

  /* ── Tender Methods ── */
  async createTender(data: {
    title: string;
    organization: string;
    tenderReference?: string;
    documentRef: string;
    extractedText: string;
    userId: string;
    requirements?: TenderRequirement[];
    documents?: DocumentItem[];
  }): Promise<TenderRecord> {
    const requirements =
      data.requirements && data.requirements.length > 0
        ? data.requirements
        : extractTenderRequirements(data.extractedText, {
            title: data.title,
            organization: data.organization,
            tenderReference: data.tenderReference,
          });

    const tenderRef = data.tenderReference?.trim() || `TND-${Date.now().toString().slice(-6)}`;

    const isConnected = await connectToDatabase();
    if (isConnected) {
      const doc = await Tender.create({
        title: data.title.trim(),
        organization: data.organization.trim(),
        tenderReference: tenderRef,
        documentRef: data.documentRef,
        extractedText: data.extractedText,
        userId: data.userId,
        status: 'Completed',
        requirements,
        documents: data.documents || [],
      });

      return {
        id: doc._id.toString(),
        title: doc.title,
        organization: doc.organization,
        tenderReference: doc.tenderReference,
        documentRef: doc.documentRef,
        extractedText: doc.extractedText,
        userId: doc.userId,
        status: doc.status,
        requirements: doc.requirements,
        documents: doc.documents || [],
        biddersCount: 0,
        bidders: [],
        createdAt: doc.createdAt.toISOString(),
      };
    }

    const store = ensureDataFile();
    const id = 'tnd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newTender: StoredTender = {
      _id: id,
      id,
      title: data.title.trim(),
      organization: data.organization.trim(),
      tenderReference: tenderRef,
      documentRef: data.documentRef,
      extractedText: data.extractedText,
      userId: data.userId,
      status: 'Completed',
      requirements,
      documents: data.documents || [],
      createdAt: new Date().toISOString(),
    };

    store.tenders.push(newTender);
    writeDataFile(store);

    return {
      ...newTender,
      biddersCount: 0,
      bidders: [],
    };
  },

  async findTendersByUser(userId: string): Promise<TenderRecord[]> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const tenders = await Tender.find({ userId }).sort({ createdAt: -1 }).lean();
      const results: TenderRecord[] = [];

      for (const t of tenders) {
        const tId = (t as any)._id.toString();
        const verifications = await Verification.find({ tenderId: tId }).sort({ createdAt: -1 }).lean();

        results.push({
          id: tId,
          title: (t as any).title,
          organization: (t as any).organization,
          tenderReference: (t as any).tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
          documentRef: (t as any).documentRef,
          extractedText: (t as any).extractedText || '',
          userId: (t as any).userId,
          status: (t as any).status || 'Completed',
          requirements: (t as any).requirements || [],
          documents: (t as any).documents || [],
          biddersCount: verifications.length,
          bidders: verifications.map((v: any) => ({
            ...v,
            id: v._id.toString(),
          })),
          createdAt: (t as any).createdAt ? new Date((t as any).createdAt).toISOString() : new Date().toISOString(),
        });
      }
      return results;
    }

    const store = ensureDataFile();
    const userTenders = store.tenders
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return userTenders.map((t) => {
      const tId = t.id || t._id;
      const bidders = store.verifications.filter((v) => v.tenderId === tId);
      return {
        id: tId,
        title: t.title,
        organization: t.organization,
        tenderReference: t.tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
        documentRef: t.documentRef,
        extractedText: t.extractedText || '',
        userId: t.userId,
        status: t.status || 'Completed',
        requirements: t.requirements || [],
        documents: t.documents || [],
        biddersCount: bidders.length,
        bidders: bidders.map((b) => ({ ...b, id: b.id || b._id || '' })),
        createdAt: t.createdAt,
      };
    });
  },

  async findTenderById(id: string): Promise<TenderRecord | null> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const t = await Tender.findById(id).lean();
      if (!t) return null;
      const tId = (t as any)._id.toString();
      const verifications = await Verification.find({ tenderId: tId }).sort({ createdAt: -1 }).lean();

      return {
        id: tId,
        title: (t as any).title,
        organization: (t as any).organization,
        tenderReference: (t as any).tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
        documentRef: (t as any).documentRef,
        extractedText: (t as any).extractedText || '',
        userId: (t as any).userId,
        status: (t as any).status || 'Completed',
        requirements: (t as any).requirements || [],
        documents: (t as any).documents || [],
        biddersCount: verifications.length,
        bidders: verifications.map((v: any) => ({
          ...v,
          id: v._id.toString(),
        })),
        createdAt: (t as any).createdAt ? new Date((t as any).createdAt).toISOString() : new Date().toISOString(),
      };
    }

    const store = ensureDataFile();
    const t = store.tenders.find((item) => item.id === id || item._id === id);
    if (!t) return null;
    const tId = t.id || t._id;
    const bidders = store.verifications.filter((v) => v.tenderId === tId);

    return {
      id: tId,
      title: t.title,
      organization: t.organization,
      tenderReference: t.tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
      documentRef: t.documentRef,
      extractedText: t.extractedText || '',
      userId: t.userId,
      status: t.status || 'Completed',
      requirements: t.requirements || [],
      documents: t.documents || [],
      biddersCount: bidders.length,
      bidders: bidders.map((b) => ({ ...b, id: b.id || b._id || '' })),
      createdAt: t.createdAt,
    };
  },

  async deleteTender(id: string, userId: string): Promise<boolean> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const tender = await Tender.findOne({ _id: id, userId });
      if (!tender) return false;
      await Tender.findByIdAndDelete(id);
      await Verification.deleteMany({ tenderId: id });
      return true;
    }

    const store = ensureDataFile();
    const tenderIndex = store.tenders.findIndex((t) => (t.id === id || t._id === id) && t.userId === userId);
    if (tenderIndex === -1) return false;

    store.tenders.splice(tenderIndex, 1);
    store.verifications = store.verifications.filter((v) => v.tenderId !== id);
    writeDataFile(store);
    return true;
  },

  /* ── Verification (Bidder) Methods ── */
  async saveVerification(data: VerificationReport & { userId: string }): Promise<VerificationReport> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const doc = await Verification.create({
        ...data,
        createdAt: new Date(),
      });
      return {
        ...data,
        id: doc._id.toString(),
        createdAt: doc.createdAt.toISOString(),
      };
    }

    const store = ensureDataFile();
    const id = data.id || 'vfr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const record: StoredVerification = {
      ...data,
      _id: id,
      id,
      createdAt: new Date().toISOString(),
    };

    store.verifications.push(record);
    writeDataFile(store);
    return record;
  },

  async findVerificationById(id: string): Promise<VerificationReport | null> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const doc = await Verification.findById(id).lean();
      if (!doc) return null;
      return {
        ...(doc as any),
        id: (doc as any)._id.toString(),
      };
    }

    const store = ensureDataFile();
    const found = store.verifications.find((v) => v.id === id || v._id === id);
    if (!found) return null;
    return {
      ...found,
      id: found.id || found._id || '',
    };
  },

  async findVerificationsByTender(tenderId: string): Promise<VerificationReport[]> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const docs = await Verification.find({ tenderId }).sort({ createdAt: -1 }).lean();
      return docs.map((d: any) => ({
        ...d,
        id: d._id.toString(),
      }));
    }

    const store = ensureDataFile();
    return store.verifications
      .filter((v) => v.tenderId === tenderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((v) => ({ ...v, id: v.id || v._id || '' }));
  },

  async submitVerificationFeedback(
    verificationId: string,
    feedback: VerificationFeedback
  ): Promise<boolean> {
    const isConnected = await connectToDatabase();
    const feedbackData = {
      ...feedback,
      submittedAt: new Date().toISOString(),
    };

    if (isConnected) {
      const res = await Verification.findByIdAndUpdate(verificationId, {
        $set: { feedback: feedbackData },
      });
      return !!res;
    }

    const store = ensureDataFile();
    const index = store.verifications.findIndex(
      (v) => v.id === verificationId || v._id === verificationId
    );
    if (index === -1) return false;

    store.verifications[index].feedback = feedbackData;
    writeDataFile(store);
    return true;
  },

  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const tenders = await Tender.find({ userId }).lean();
      const verifications = await Verification.find({ userId }).sort({ createdAt: -1 }).lean();

      const totalTenders = tenders.length;
      const totalBiddersVerified = verifications.length;

      let scoreSum = 0;
      const riskDistribution = { low: 0, medium: 0, high: 0 };

      for (const v of verifications as any[]) {
        scoreSum += v.complianceScore;
        if (v.riskLevel === 'LOW' || v.riskLevel === 'Low Risk') riskDistribution.low++;
        else if (v.riskLevel === 'MEDIUM' || v.riskLevel === 'Medium Risk') riskDistribution.medium++;
        else riskDistribution.high++;
      }

      const averageComplianceScore =
        totalBiddersVerified > 0 ? Math.round(scoreSum / totalBiddersVerified) : 0;

      const recentVerifications = verifications.slice(0, 6).map((v: any) => ({
        id: v._id.toString(),
        tenderId: v.tenderId,
        tenderTitle: v.tenderTitle,
        bidderName: v.bidderName,
        complianceScore: v.complianceScore,
        compliancePercentage: v.compliancePercentage,
        riskScore: v.riskScore,
        riskLevel: v.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        submittedAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
      }));

      return {
        totalTenders,
        totalBiddersVerified,
        averageComplianceScore,
        riskDistribution,
        recentVerifications,
        // Legacy compatibility
        completedAnalysis: totalBiddersVerified,
        pendingAnalysis: 0,
        averageScore: averageComplianceScore,
      };
    }

    const store = ensureDataFile();
    const userTenders = store.tenders.filter((t) => t.userId === userId);
    const userVerifications = store.verifications.filter((v) => v.userId === userId);

    const totalTenders = userTenders.length;
    const totalBiddersVerified = userVerifications.length;

    let scoreSum = 0;
    const riskDistribution = { low: 0, medium: 0, high: 0 };

    for (const v of userVerifications) {
      scoreSum += v.complianceScore;
      if (v.riskLevel === 'LOW') riskDistribution.low++;
      else if (v.riskLevel === 'MEDIUM') riskDistribution.medium++;
      else riskDistribution.high++;
    }

    const averageComplianceScore =
      totalBiddersVerified > 0 ? Math.round(scoreSum / totalBiddersVerified) : 0;

    const recentVerifications = userVerifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((v) => ({
        id: v.id || v._id || '',
        tenderId: v.tenderId,
        tenderTitle: v.tenderTitle,
        bidderName: v.bidderName,
        complianceScore: v.complianceScore,
        compliancePercentage: v.compliancePercentage,
        riskScore: v.riskScore,
        riskLevel: v.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        submittedAt: v.createdAt,
      }));

    return {
      totalTenders,
      totalBiddersVerified,
      averageComplianceScore,
      riskDistribution,
      recentVerifications,
      completedAnalysis: totalBiddersVerified,
      pendingAnalysis: 0,
      averageScore: averageComplianceScore,
    };
  },
};
