import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from './models/User';
import Tender from './models/Tender';
import Verification from './models/Verification';
import Application from './models/Application';
import { extractTenderRequirements } from './analysis-engine';
import {
  TenderRecord,
  TenderRequirement,
  VerificationReport,
  VerificationFeedback,
  DashboardMetrics,
  DocumentItem,
  TenderApplication,
  TenderStatus,
  ApplicationStatus,
  OfficerDecision,
  UserProfile,
  UserRole,
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
  role?: UserRole;
  companyName?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  contactNumber?: string;
  address?: string;
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
  status: TenderStatus;
  requirements: TenderRequirement[];
  documents?: DocumentItem[];
  description?: string;
  category?: string;
  location?: string;
  estimatedBudget?: string;
  submissionDeadline?: string;
  publishedAt?: string;
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

interface StoredApplication extends TenderApplication {
  _id?: string;
}

interface LocalStore {
  users: StoredUser[];
  tenders: StoredTender[];
  verifications: StoredVerification[];
  applications?: StoredApplication[];
  analyses?: any[];
}

function ensureDataFile(): LocalStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let store: LocalStore;
  if (!fs.existsSync(DATA_FILE)) {
    store = { users: [], tenders: [], verifications: [], applications: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return store;
  }

  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    store = JSON.parse(content);
    if (!store.users) store.users = [];
    if (!store.tenders) store.tenders = [];
    if (!store.verifications) store.verifications = [];
    if (!store.applications) store.applications = [];
  } catch {
    store = { users: [], tenders: [], verifications: [], applications: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return store;
  }

  // Graceful migration: Ensure all existing tenders have requirements and defaults populated
  let migrated = false;
  for (const t of store.tenders) {
    if (!t.requirements || t.requirements.length === 0) {
      t.requirements = extractTenderRequirements(t.extractedText || '', {
        title: t.title,
        organization: t.organization,
        tenderReference: t.tenderReference,
      });
      if (!t.tenderReference) {
        t.tenderReference = 'TND-REF-' + (t.id || t._id).slice(-6).toUpperCase();
      }
      migrated = true;
    }
    // Backward-compat: 'Completed' tenders treat as 'Published'
    if (!t.status || t.status === ('Completed' as any)) {
      t.status = 'Published';
      migrated = true;
    }
    if (!t.category) {
      t.category = 'General Procurement';
      migrated = true;
    }
    if (!t.location) {
      t.location = 'Central / Pan-India';
      migrated = true;
    }
    if (!t.submissionDeadline) {
      t.submissionDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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
  /* ── User Auth & Profile Methods ── */
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
        role: ((user as any).role || 'officer') as UserRole,
        companyName: (user as any).companyName || '',
        pan: (user as any).pan || '',
        gstin: (user as any).gstin || '',
        udyamNumber: (user as any).udyamNumber || '',
        contactNumber: (user as any).contactNumber || '',
        address: (user as any).address || '',
        createdAt: (user as any).createdAt,
      };
    }
    const store = ensureDataFile();
    const found = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) return null;
    return {
      ...found,
      id: found._id || found.id,
      role: (found.role || 'officer') as UserRole,
    };
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
        role: ((user as any).role || 'officer') as UserRole,
        companyName: (user as any).companyName || '',
        pan: (user as any).pan || '',
        gstin: (user as any).gstin || '',
        udyamNumber: (user as any).udyamNumber || '',
        contactNumber: (user as any).contactNumber || '',
        address: (user as any).address || '',
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
      role: (found.role || 'officer') as UserRole,
      companyName: found.companyName || '',
      pan: found.pan || '',
      gstin: found.gstin || '',
      udyamNumber: found.udyamNumber || '',
      contactNumber: found.contactNumber || '',
      address: found.address || '',
      createdAt: found.createdAt,
    };
  },

  async createUser(data: { name: string; email: string; passwordHash: string; role?: UserRole }) {
    const isConnected = await connectToDatabase();
    const cleanEmail = data.email.toLowerCase().trim();
    const role: UserRole = data.role || 'officer';

    if (isConnected) {
      const doc = await User.create({
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash: data.passwordHash,
        role,
      });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: (doc.role || 'officer') as UserRole,
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
      role,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    writeDataFile(store);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role || 'officer',
      createdAt: newUser.createdAt,
    };
  },

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true }
      ).lean();
      if (!updated) return null;
      return {
        id: (updated as any)._id.toString(),
        name: (updated as any).name,
        email: (updated as any).email,
        role: ((updated as any).role || 'officer') as UserRole,
        companyName: (updated as any).companyName || '',
        pan: (updated as any).pan || '',
        gstin: (updated as any).gstin || '',
        udyamNumber: (updated as any).udyamNumber || '',
        contactNumber: (updated as any).contactNumber || '',
        address: (updated as any).address || '',
        createdAt: (updated as any).createdAt ? new Date((updated as any).createdAt).toISOString() : new Date().toISOString(),
      };
    }

    const store = ensureDataFile();
    const idx = store.users.findIndex((u) => u.id === userId || u._id === userId);
    if (idx === -1) return null;
    store.users[idx] = {
      ...store.users[idx],
      ...data,
    };
    writeDataFile(store);
    const u = store.users[idx];
    return {
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      role: (u.role || 'officer') as UserRole,
      companyName: u.companyName || '',
      pan: u.pan || '',
      gstin: u.gstin || '',
      udyamNumber: u.udyamNumber || '',
      contactNumber: u.contactNumber || '',
      address: u.address || '',
      createdAt: u.createdAt,
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
    status?: TenderStatus;
    requirements?: TenderRequirement[];
    documents?: DocumentItem[];
    description?: string;
    category?: string;
    location?: string;
    estimatedBudget?: string;
    submissionDeadline?: string;
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
    const status: TenderStatus = data.status || 'Draft';
    const publishedAt = status === 'Published' ? new Date() : undefined;

    const isConnected = await connectToDatabase();
    if (isConnected) {
      const doc = await Tender.create({
        title: data.title.trim(),
        organization: data.organization.trim(),
        tenderReference: tenderRef,
        documentRef: data.documentRef,
        extractedText: data.extractedText,
        userId: data.userId,
        status,
        description: data.description || '',
        category: data.category || 'General Procurement',
        location: data.location || 'Central / Pan-India',
        estimatedBudget: data.estimatedBudget || '',
        submissionDeadline: data.submissionDeadline || '',
        publishedAt,
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
        description: doc.description,
        category: doc.category,
        location: doc.location,
        estimatedBudget: doc.estimatedBudget,
        submissionDeadline: doc.submissionDeadline,
        publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : undefined,
        requirements: doc.requirements,
        documents: doc.documents || [],
        biddersCount: 0,
        applicationsCount: 0,
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
      status,
      description: data.description || '',
      category: data.category || 'General Procurement',
      location: data.location || 'Central / Pan-India',
      estimatedBudget: data.estimatedBudget || '',
      submissionDeadline: data.submissionDeadline || '',
      publishedAt: publishedAt ? publishedAt.toISOString() : undefined,
      requirements,
      documents: data.documents || [],
      createdAt: new Date().toISOString(),
    };

    store.tenders.push(newTender);
    writeDataFile(store);

    return {
      ...newTender,
      biddersCount: 0,
      applicationsCount: 0,
      bidders: [],
    };
  },

  async updateTender(
    id: string,
    userId: string,
    data: Partial<TenderRecord>
  ): Promise<TenderRecord | null> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const updatePayload: any = { ...data };
      if (data.status === 'Published' && !data.publishedAt) {
        updatePayload.publishedAt = new Date();
      }
      const updated = await Tender.findOneAndUpdate(
        { _id: id, userId },
        { $set: updatePayload },
        { new: true }
      ).lean();
      if (!updated) return null;
      return this.findTenderById(id);
    }

    const store = ensureDataFile();
    const idx = store.tenders.findIndex((t) => (t.id === id || t._id === id) && t.userId === userId);
    if (idx === -1) return null;

    if (data.status === 'Published' && !store.tenders[idx].publishedAt) {
      data.publishedAt = new Date().toISOString();
    }

    store.tenders[idx] = {
      ...store.tenders[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeDataFile(store);
    return this.findTenderById(id);
  },

  async findTendersByUser(userId: string): Promise<TenderRecord[]> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const tenders = await Tender.find({ userId }).sort({ createdAt: -1 }).lean();
      const results: TenderRecord[] = [];

      for (const t of tenders) {
        const tId = (t as any)._id.toString();
        const verifications = await Verification.find({ tenderId: tId }).sort({ createdAt: -1 }).lean();
        const appCount = await Application.countDocuments({ tenderId: tId });

        results.push({
          id: tId,
          title: (t as any).title,
          organization: (t as any).organization,
          tenderReference: (t as any).tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
          documentRef: (t as any).documentRef,
          extractedText: (t as any).extractedText || '',
          userId: (t as any).userId,
          status: ((t as any).status === 'Completed' ? 'Published' : (t as any).status) || 'Draft',
          description: (t as any).description || '',
          category: (t as any).category || 'General Procurement',
          location: (t as any).location || 'Central / Pan-India',
          estimatedBudget: (t as any).estimatedBudget || '',
          submissionDeadline: (t as any).submissionDeadline || '',
          publishedAt: (t as any).publishedAt ? new Date((t as any).publishedAt).toISOString() : undefined,
          requirements: (t as any).requirements || [],
          documents: (t as any).documents || [],
          biddersCount: verifications.length,
          applicationsCount: appCount,
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
      const appCount = (store.applications || []).filter((a) => a.tenderId === tId).length;
      return {
        id: tId,
        title: t.title,
        organization: t.organization,
        tenderReference: t.tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
        documentRef: t.documentRef,
        extractedText: t.extractedText || '',
        userId: t.userId,
        status: (t.status === ('Completed' as any) ? 'Published' : t.status) || 'Draft',
        description: t.description || '',
        category: t.category || 'General Procurement',
        location: t.location || 'Central / Pan-India',
        estimatedBudget: t.estimatedBudget || '',
        submissionDeadline: t.submissionDeadline || '',
        publishedAt: t.publishedAt,
        requirements: t.requirements || [],
        documents: t.documents || [],
        biddersCount: bidders.length,
        applicationsCount: appCount,
        bidders: bidders.map((b) => ({ ...b, id: b.id || b._id || '' })),
        createdAt: t.createdAt,
      };
    });
  },

  async findPublishedTenders(filters?: {
    search?: string;
    category?: string;
    department?: string;
  }): Promise<TenderRecord[]> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const query: any = { status: { $in: ['Published', 'Completed'] } };
      if (filters?.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      if (filters?.department && filters.department !== 'All') {
        query.organization = new RegExp(filters.department, 'i');
      }

      const tenders = await Tender.find(query).sort({ createdAt: -1 }).lean();
      const results: TenderRecord[] = [];

      for (const t of tenders) {
        const tId = (t as any)._id.toString();
        const appCount = await Application.countDocuments({ tenderId: tId });
        const tenderItem: TenderRecord = {
          id: tId,
          title: (t as any).title,
          organization: (t as any).organization,
          tenderReference: (t as any).tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
          documentRef: (t as any).documentRef,
          extractedText: (t as any).extractedText || '',
          userId: (t as any).userId,
          status: 'Published',
          description: (t as any).description || '',
          category: (t as any).category || 'General Procurement',
          location: (t as any).location || 'Central / Pan-India',
          estimatedBudget: (t as any).estimatedBudget || '',
          submissionDeadline: (t as any).submissionDeadline || '',
          publishedAt: (t as any).publishedAt ? new Date((t as any).publishedAt).toISOString() : undefined,
          requirements: (t as any).requirements || [],
          documents: (t as any).documents || [],
          applicationsCount: appCount,
          createdAt: (t as any).createdAt ? new Date((t as any).createdAt).toISOString() : new Date().toISOString(),
        };

        if (filters?.search) {
          const s = filters.search.toLowerCase();
          const matches =
            tenderItem.title.toLowerCase().includes(s) ||
            tenderItem.organization.toLowerCase().includes(s) ||
            tenderItem.tenderReference.toLowerCase().includes(s) ||
            (tenderItem.description && tenderItem.description.toLowerCase().includes(s));
          if (!matches) continue;
        }

        results.push(tenderItem);
      }
      return results;
    }

    const store = ensureDataFile();
    let published = store.tenders.filter(
      (t) => t.status === 'Published' || t.status === ('Completed' as any)
    );

    if (filters?.category && filters.category !== 'All') {
      published = published.filter((t) => t.category === filters.category);
    }
    if (filters?.department && filters.department !== 'All') {
      published = published.filter((t) =>
        t.organization.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      published = published.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.organization.toLowerCase().includes(s) ||
          t.tenderReference.toLowerCase().includes(s) ||
          (t.description && t.description.toLowerCase().includes(s))
      );
    }

    published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return published.map((t) => {
      const tId = t.id || t._id;
      const appCount = (store.applications || []).filter((a) => a.tenderId === tId).length;
      return {
        id: tId,
        title: t.title,
        organization: t.organization,
        tenderReference: t.tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
        documentRef: t.documentRef,
        extractedText: t.extractedText || '',
        userId: t.userId,
        status: 'Published',
        description: t.description || '',
        category: t.category || 'General Procurement',
        location: t.location || 'Central / Pan-India',
        estimatedBudget: t.estimatedBudget || '',
        submissionDeadline: t.submissionDeadline || '',
        publishedAt: t.publishedAt,
        requirements: t.requirements || [],
        documents: t.documents || [],
        applicationsCount: appCount,
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
      const appCount = await Application.countDocuments({ tenderId: tId });

      return {
        id: tId,
        title: (t as any).title,
        organization: (t as any).organization,
        tenderReference: (t as any).tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
        documentRef: (t as any).documentRef,
        extractedText: (t as any).extractedText || '',
        userId: (t as any).userId,
        status: ((t as any).status === 'Completed' ? 'Published' : (t as any).status) || 'Draft',
        description: (t as any).description || '',
        category: (t as any).category || 'General Procurement',
        location: (t as any).location || 'Central / Pan-India',
        estimatedBudget: (t as any).estimatedBudget || '',
        submissionDeadline: (t as any).submissionDeadline || '',
        publishedAt: (t as any).publishedAt ? new Date((t as any).publishedAt).toISOString() : undefined,
        requirements: (t as any).requirements || [],
        documents: (t as any).documents || [],
        biddersCount: verifications.length,
        applicationsCount: appCount,
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
    const appCount = (store.applications || []).filter((a) => a.tenderId === tId).length;

    return {
      id: tId,
      title: t.title,
      organization: t.organization,
      tenderReference: t.tenderReference || 'TND-' + tId.slice(-6).toUpperCase(),
      documentRef: t.documentRef,
      extractedText: t.extractedText || '',
      userId: t.userId,
      status: (t.status === ('Completed' as any) ? 'Published' : t.status) || 'Draft',
      description: t.description || '',
      category: t.category || 'General Procurement',
      location: t.location || 'Central / Pan-India',
      estimatedBudget: t.estimatedBudget || '',
      submissionDeadline: t.submissionDeadline || '',
      publishedAt: t.publishedAt,
      requirements: t.requirements || [],
      documents: t.documents || [],
      biddersCount: bidders.length,
      applicationsCount: appCount,
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
      await Application.deleteMany({ tenderId: id });
      return true;
    }

    const store = ensureDataFile();
    const tenderIndex = store.tenders.findIndex((t) => (t.id === id || t._id === id) && t.userId === userId);
    if (tenderIndex === -1) return false;

    store.tenders.splice(tenderIndex, 1);
    store.verifications = store.verifications.filter((v) => v.tenderId !== id);
    if (store.applications) {
      store.applications = store.applications.filter((a) => a.tenderId !== id);
    }
    writeDataFile(store);
    return true;
  },

  /* ── Bidder Application Methods ── */
  async createApplication(data: {
    tenderId: string;
    tenderTitle: string;
    tenderReference: string;
    tenderDeadline?: string;
    bidderId: string;
    bidderName: string;
    bidderEmail?: string;
    companyPan?: string;
    companyGstin?: string;
    companyUdyam?: string;
    companyTurnover?: string;
    documents?: DocumentItem[];
    extractedText?: string;
    status?: ApplicationStatus;
  }): Promise<TenderApplication> {
    const status = data.status || 'Submitted';
    const isSubmitted = status === 'Submitted' || status === 'Verification Pending';
    const submittedAt = isSubmitted ? new Date() : undefined;

    const isConnected = await connectToDatabase();
    if (isConnected) {
      // Check for duplicate submitted application
      if (isSubmitted) {
        const existing = await Application.findOne({
          tenderId: data.tenderId,
          bidderId: data.bidderId,
          status: { $in: ['Submitted', 'Verification Pending', 'Verification In Progress', 'Verified'] },
        });
        if (existing) {
          throw new Error('An active application for this tender has already been submitted by this bidder.');
        }
      }

      const doc = await Application.create({
        ...data,
        status,
        submittedAt,
        documents: data.documents || [],
        extractedText: data.extractedText || '',
        isOutdated: false,
      });

      return {
        id: doc._id.toString(),
        tenderId: doc.tenderId,
        tenderTitle: doc.tenderTitle,
        tenderReference: doc.tenderReference,
        tenderDeadline: doc.tenderDeadline,
        bidderId: doc.bidderId,
        bidderName: doc.bidderName,
        bidderEmail: doc.bidderEmail,
        companyPan: doc.companyPan,
        companyGstin: doc.companyGstin,
        companyUdyam: doc.companyUdyam,
        companyTurnover: doc.companyTurnover,
        documents: doc.documents || [],
        extractedText: doc.extractedText || '',
        status: doc.status,
        submittedAt: doc.submittedAt ? doc.submittedAt.toISOString() : undefined,
        isOutdated: doc.isOutdated,
        officerDecision: doc.officerDecision,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    }

    const store = ensureDataFile();
    if (!store.applications) store.applications = [];

    if (isSubmitted) {
      const existing = store.applications.find(
        (a) =>
          a.tenderId === data.tenderId &&
          a.bidderId === data.bidderId &&
          ['Submitted', 'Verification Pending', 'Verification In Progress', 'Verified'].includes(a.status)
      );
      if (existing) {
        throw new Error('An active application for this tender has already been submitted by this bidder.');
      }
    }

    const id = 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newApp: StoredApplication = {
      _id: id,
      id,
      tenderId: data.tenderId,
      tenderTitle: data.tenderTitle,
      tenderReference: data.tenderReference,
      tenderDeadline: data.tenderDeadline,
      bidderId: data.bidderId,
      bidderName: data.bidderName,
      bidderEmail: data.bidderEmail || '',
      companyPan: data.companyPan || '',
      companyGstin: data.companyGstin || '',
      companyUdyam: data.companyUdyam || '',
      companyTurnover: data.companyTurnover || '',
      documents: data.documents || [],
      extractedText: data.extractedText || '',
      status,
      submittedAt: submittedAt ? submittedAt.toISOString() : undefined,
      isOutdated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.applications.push(newApp);
    writeDataFile(store);
    return newApp;
  },

  async updateApplication(
    id: string,
    bidderId: string,
    data: Partial<TenderApplication>
  ): Promise<TenderApplication | null> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const existing = await Application.findOne({ _id: id, bidderId });
      if (!existing) return null;

      // If documents or evidence changed, flag verification as outdated
      const documentsChanged = data.documents && data.documents.length > 0;
      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };
      if (documentsChanged && existing.latestVerificationId) {
        updateData.isOutdated = true;
        await Verification.findByIdAndUpdate(existing.latestVerificationId, {
          $set: { isOutdated: true },
        });
      }

      if (data.status === 'Submitted' && !existing.submittedAt) {
        updateData.submittedAt = new Date();
      }

      const updated = await Application.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).lean();

      if (!updated) return null;
      return this.findApplicationById(id);
    }

    const store = ensureDataFile();
    if (!store.applications) store.applications = [];
    const idx = store.applications.findIndex((a) => (a.id === id || a._id === id) && a.bidderId === bidderId);
    if (idx === -1) return null;

    const existing = store.applications[idx];
    const documentsChanged = data.documents && data.documents.length > 0;

    if (documentsChanged && existing.latestVerificationId) {
      data.isOutdated = true;
      const vIdx = store.verifications.findIndex(
        (v) => v.id === existing.latestVerificationId || v._id === existing.latestVerificationId
      );
      if (vIdx !== -1) {
        store.verifications[vIdx].isOutdated = true;
      }
    }

    if (data.status === 'Submitted' && !existing.submittedAt) {
      data.submittedAt = new Date().toISOString();
    }

    store.applications[idx] = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeDataFile(store);
    return this.findApplicationById(id);
  },

  async findApplicationById(id: string): Promise<TenderApplication | null> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const doc = await Application.findById(id).lean();
      if (!doc) return null;
      const appId = (doc as any)._id.toString();

      let verificationReport: VerificationReport | undefined;
      if ((doc as any).latestVerificationId) {
        const v = await Verification.findById((doc as any).latestVerificationId).lean();
        if (v) {
          verificationReport = {
            ...(v as any),
            id: (v as any)._id.toString(),
          };
        }
      }

      return {
        id: appId,
        tenderId: (doc as any).tenderId,
        tenderTitle: (doc as any).tenderTitle,
        tenderReference: (doc as any).tenderReference,
        tenderDeadline: (doc as any).tenderDeadline,
        bidderId: (doc as any).bidderId,
        bidderName: (doc as any).bidderName,
        bidderEmail: (doc as any).bidderEmail,
        companyPan: (doc as any).companyPan,
        companyGstin: (doc as any).companyGstin,
        companyUdyam: (doc as any).companyUdyam,
        companyTurnover: (doc as any).companyTurnover,
        documents: (doc as any).documents || [],
        extractedText: (doc as any).extractedText || '',
        status: (doc as any).status,
        submittedAt: (doc as any).submittedAt ? new Date((doc as any).submittedAt).toISOString() : undefined,
        latestVerificationId: (doc as any).latestVerificationId,
        verificationReport,
        isOutdated: (doc as any).isOutdated || false,
        officerDecision: (doc as any).officerDecision,
        createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
        updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : new Date().toISOString(),
      };
    }

    const store = ensureDataFile();
    const app = (store.applications || []).find((a) => a.id === id || a._id === id);
    if (!app) return null;

    let verificationReport: VerificationReport | undefined;
    if (app.latestVerificationId) {
      verificationReport = store.verifications.find(
        (v) => v.id === app.latestVerificationId || v._id === app.latestVerificationId
      );
    }

    return {
      ...app,
      id: app.id || app._id || '',
      verificationReport,
    };
  },

  async findApplicationsByTender(tenderId: string): Promise<TenderApplication[]> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const docs = await Application.find({ tenderId }).sort({ createdAt: -1 }).lean();
      const results: TenderApplication[] = [];

      for (const doc of docs) {
        const appId = (doc as any)._id.toString();
        let verificationReport: VerificationReport | undefined;
        if ((doc as any).latestVerificationId) {
          const v = await Verification.findById((doc as any).latestVerificationId).lean();
          if (v) {
            verificationReport = { ...(v as any), id: (v as any)._id.toString() };
          }
        }

        results.push({
          id: appId,
          tenderId: (doc as any).tenderId,
          tenderTitle: (doc as any).tenderTitle,
          tenderReference: (doc as any).tenderReference,
          tenderDeadline: (doc as any).tenderDeadline,
          bidderId: (doc as any).bidderId,
          bidderName: (doc as any).bidderName,
          bidderEmail: (doc as any).bidderEmail,
          companyPan: (doc as any).companyPan,
          companyGstin: (doc as any).companyGstin,
          companyUdyam: (doc as any).companyUdyam,
          companyTurnover: (doc as any).companyTurnover,
          documents: (doc as any).documents || [],
          extractedText: (doc as any).extractedText || '',
          status: (doc as any).status,
          submittedAt: (doc as any).submittedAt ? new Date((doc as any).submittedAt).toISOString() : undefined,
          latestVerificationId: (doc as any).latestVerificationId,
          verificationReport,
          isOutdated: (doc as any).isOutdated || false,
          officerDecision: (doc as any).officerDecision,
          createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
          updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : new Date().toISOString(),
        });
      }
      return results;
    }

    const store = ensureDataFile();
    const apps = (store.applications || []).filter((a) => a.tenderId === tenderId);
    return apps.map((app) => {
      let verificationReport: VerificationReport | undefined;
      if (app.latestVerificationId) {
        verificationReport = store.verifications.find(
          (v) => v.id === app.latestVerificationId || v._id === app.latestVerificationId
        );
      }
      return {
        ...app,
        id: app.id || app._id || '',
        verificationReport,
      };
    });
  },

  async findApplicationsByBidder(bidderId: string): Promise<TenderApplication[]> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const docs = await Application.find({ bidderId }).sort({ createdAt: -1 }).lean();
      const results: TenderApplication[] = [];

      for (const doc of docs) {
        const appId = (doc as any)._id.toString();
        let verificationReport: VerificationReport | undefined;
        if ((doc as any).latestVerificationId) {
          const v = await Verification.findById((doc as any).latestVerificationId).lean();
          if (v) {
            verificationReport = { ...(v as any), id: (v as any)._id.toString() };
          }
        }

        results.push({
          id: appId,
          tenderId: (doc as any).tenderId,
          tenderTitle: (doc as any).tenderTitle,
          tenderReference: (doc as any).tenderReference,
          tenderDeadline: (doc as any).tenderDeadline,
          bidderId: (doc as any).bidderId,
          bidderName: (doc as any).bidderName,
          bidderEmail: (doc as any).bidderEmail,
          companyPan: (doc as any).companyPan,
          companyGstin: (doc as any).companyGstin,
          companyUdyam: (doc as any).companyUdyam,
          companyTurnover: (doc as any).companyTurnover,
          documents: (doc as any).documents || [],
          extractedText: (doc as any).extractedText || '',
          status: (doc as any).status,
          submittedAt: (doc as any).submittedAt ? new Date((doc as any).submittedAt).toISOString() : undefined,
          latestVerificationId: (doc as any).latestVerificationId,
          verificationReport,
          isOutdated: (doc as any).isOutdated || false,
          officerDecision: (doc as any).officerDecision,
          createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
          updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : new Date().toISOString(),
        });
      }
      return results;
    }

    const store = ensureDataFile();
    const apps = (store.applications || [])
      .filter((a) => a.bidderId === bidderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return apps.map((app) => {
      let verificationReport: VerificationReport | undefined;
      if (app.latestVerificationId) {
        verificationReport = store.verifications.find(
          (v) => v.id === app.latestVerificationId || v._id === app.latestVerificationId
        );
      }
      return {
        ...app,
        id: app.id || app._id || '',
        verificationReport,
      };
    });
  },

  async updateApplicationDecision(
    applicationId: string,
    decision: OfficerDecision
  ): Promise<boolean> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const res = await Application.findByIdAndUpdate(applicationId, {
        $set: {
          officerDecision: decision,
          status: decision.status === 'Approved' ? 'Verified' : decision.status === 'Rejected' ? 'Rejected' : 'Needs Review',
        },
      });
      return !!res;
    }

    const store = ensureDataFile();
    if (!store.applications) return false;
    const idx = store.applications.findIndex((a) => a.id === applicationId || a._id === applicationId);
    if (idx === -1) return false;

    store.applications[idx].officerDecision = decision;
    store.applications[idx].status =
      decision.status === 'Approved' ? 'Verified' : decision.status === 'Rejected' ? 'Rejected' : 'Needs Review';
    store.applications[idx].updatedAt = new Date().toISOString();
    writeDataFile(store);
    return true;
  },

  /* ── Verification (Audit Report) Methods ── */
  async saveVerification(data: VerificationReport & { userId: string }): Promise<VerificationReport> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const doc = await Verification.create({
        ...data,
        createdAt: new Date(),
      });
      const vId = doc._id.toString();

      // If linked to an application, update application status and pointer
      if (data.applicationId) {
        await Application.findByIdAndUpdate(data.applicationId, {
          $set: {
            latestVerificationId: vId,
            status: 'Verified',
            isOutdated: false,
          },
        });
      }

      return {
        ...data,
        id: vId,
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

    if (data.applicationId && store.applications) {
      const aIdx = store.applications.findIndex(
        (a) => a.id === data.applicationId || a._id === data.applicationId
      );
      if (aIdx !== -1) {
        store.applications[aIdx].latestVerificationId = id;
        store.applications[aIdx].status = 'Verified';
        store.applications[aIdx].isOutdated = false;
        store.applications[aIdx].updatedAt = new Date().toISOString();
      }
    }

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

  /* ── Dashboard Metrics (Calculated from Real Database Data) ── */
  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const tenders = await Tender.find({}).lean();
      const userTenders = await Tender.find({ userId }).lean();
      const verifications = await Verification.find({}).sort({ createdAt: -1 }).lean();
      const applications = await Application.find({}).sort({ createdAt: -1 }).lean();

      const publishedTenders = tenders.filter(
        (t: any) => t.status === 'Published' || t.status === 'Completed'
      ).length;
      const draftTenders = tenders.filter((t: any) => t.status === 'Draft').length;
      const totalTenders = tenders.length;
      const totalApplications = applications.length;
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
        applicationId: v.applicationId,
      }));

      return {
        totalTenders,
        publishedTenders,
        draftTenders,
        totalApplications,
        totalBiddersVerified,
        averageComplianceScore,
        riskDistribution,
        recentVerifications,
        completedAnalysis: totalBiddersVerified,
        pendingAnalysis: applications.filter(
          (a: any) => a.status === 'Submitted' || a.status === 'Verification Pending'
        ).length,
        averageScore: averageComplianceScore,
      };
    }

    const store = ensureDataFile();
    const tenders = store.tenders || [];
    const applications = store.applications || [];
    const verifications = store.verifications || [];

    const publishedTenders = tenders.filter(
      (t) => t.status === 'Published' || t.status === ('Completed' as any)
    ).length;
    const draftTenders = tenders.filter((t) => t.status === 'Draft').length;
    const totalTenders = tenders.length;
    const totalApplications = applications.length;
    const totalBiddersVerified = verifications.length;

    let scoreSum = 0;
    const riskDistribution = { low: 0, medium: 0, high: 0 };

    for (const v of verifications) {
      scoreSum += v.complianceScore;
      if (v.riskLevel === 'LOW') riskDistribution.low++;
      else if (v.riskLevel === 'MEDIUM') riskDistribution.medium++;
      else riskDistribution.high++;
    }

    const averageComplianceScore =
      totalBiddersVerified > 0 ? Math.round(scoreSum / totalBiddersVerified) : 0;

    const recentVerifications = verifications
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
        applicationId: v.applicationId,
      }));

    return {
      totalTenders,
      publishedTenders,
      draftTenders,
      totalApplications,
      totalBiddersVerified,
      averageComplianceScore,
      riskDistribution,
      recentVerifications,
      completedAnalysis: totalBiddersVerified,
      pendingAnalysis: applications.filter(
        (a) => a.status === 'Submitted' || a.status === 'Verification Pending'
      ).length,
      averageScore: averageComplianceScore,
    };
  },
};
