'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { MultiPdfUpload } from '@/components/MultiPdfUpload';
import { TenderRecord } from '@/types';
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Layers,
  ChevronRight,
  Plus,
  X,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from 'lucide-react';

export default function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [tender, setTender] = useState<TenderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  // New Bidder Verification Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [bidderName, setBidderName] = useState('');
  const [bidderFiles, setBidderFiles] = useState<File[]>([]);
  const [bidderText, setBidderText] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchTender = () => {
    fetch(`/api/tenders/${resolvedParams.id}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        if (!res.ok) throw new Error('Tender record not found.');
        return res.json();
      })
      .then((data) => {
        if (data && data.tender) setTender(data.tender);
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err.message || 'Failed to retrieve tender.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/login');
        return res.json();
      })
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => router.push('/login'));

    fetchTender();
  }, [resolvedParams.id, router]);

  const handleVerifyBidder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidderName.trim()) {
      setUploadError('Please enter the bidder name.');
      return;
    }
    if (bidderFiles.length === 0 && !bidderText.trim()) {
      setUploadError('Please select at least one bidder PDF document or provide submission text.');
      return;
    }
    if (bidderFiles.length > 10) {
      setUploadError('Maximum 10 bidder PDF documents allowed per batch.');
      return;
    }

    setVerifying(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('bidderName', bidderName.trim());
      bidderFiles.forEach((file) => {
        formData.append('files', file);
      });
      if (bidderText) {
        formData.append('extractedText', bidderText);
      }

      const res = await fetch(`/api/tenders/${resolvedParams.id}/bidders`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify bidder against tender.');
      }

      setModalOpen(false);
      setBidderName('');
      setBidderFiles([]);
      setBidderText('');

      // Redirect directly to the generated AI verification report
      router.push(`/verifications/${data.verification.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error verifying bidder';
      setUploadError(msg);
    } finally {
      setVerifying(false);
    }
  };

  // 1-Click Sample Bidder Loader for testing
  const handleLoadSampleBidder = (type: 'compliant' | 'medium' | 'high') => {
    setUploadError('');
    setBidderFiles([]);
    if (type === 'compliant') {
      setBidderName('ABC Technologies Pvt Ltd');
      setBidderText(`BIDDER QUALIFICATION SUBMISSION
Bidder: ABC Technologies Pvt Ltd
Tender Reference: ${tender?.tenderReference || 'TND-2026'}
1. GST REGISTRATION: Active GSTIN 27ABCDE1234F1Z5. Regular GSTR-3B filings enclosed for last 12 months.
2. PAN & TAX: Permanent Account Number AAACA9999P. Last 3 years Income Tax Returns (ITR-V) enclosed.
3. COMPANY REGISTRATION: Registered under Companies Act 2013, CIN: U72200MH2016PTC284910.
4. MSME / UDYAM: Registered as Micro enterprise under Udyam Registration UDYAM-MH-02-0012345.
5. FINANCIAL CAPACITY: Annual average turnover of INR 18.5 Crores over preceding 3 financial years. Audited balance sheets with CA UDIN: 26045812BKRLPX8819 verified.
6. OEM AUTHORIZATION: Official Manufacturer Authorization Form (MAF) from Equipment OEM enclosed for all active equipment.
7. PAST EXPERIENCE: Executed 4 similar large-scale projects. Client work orders and completion certificates attached.
8. MAKE IN INDIA: Self-declaration of 65% Class-I Local Content under PPP-MII policy.
9. NON-BLACKLISTING: Notarized affidavit affirming non-debarment and non-blacklisting on INR 100 non-judicial stamp paper.`);
    } else if (type === 'medium') {
      setBidderName('XYZ Solutions & Networks');
      setBidderText(`BIDDER QUALIFICATION DOSSIER
Bidder: XYZ Solutions & Networks
Tender: ${tender?.title || 'Procurement Tender'}
1. GSTIN: 07BBBBB5678G2Z1 active registration.
2. PAN: BBBBB5678G attached.
3. FINANCIAL: Average turnover of INR 8.2 Crores. CA turnover certificate provided without explicit UDIN number.
4. OEM AUTHORIZATION: Standard reseller authorization attached; tender-specific MAF is currently under processing from manufacturer.
5. PAST WORK: 1 completed project certificate enclosed. Second project completion pending signoff.
6. MAKE IN INDIA: Local content declaration submitted with 45% estimation.
7. NON-BLACKLISTING: Declaration letter on company letterhead.`);
    } else {
      setBidderName('PQR Systems');
      setBidderText(`BIDDER PROPOSAL
Bidder: PQR Systems
General proposal for IT and Equipment supply.
Company Profile: We are a regional vendor providing supplies.
Financials: Adequate financial capability to execute works.
Experience: Completed miscellaneous supply orders in regional markets.
Note: Statutory certificates and specific OEM authorization letters will be submitted post-qualification upon request.`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-base)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500" />
            <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Loading Tender &amp; Bidder History...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar userName={user?.name} userEmail={user?.email} />
        <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">Tender Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            {error || 'The requested tender could not be located.'}
          </p>
          <Link
            href="/tenders"
            className="btn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white"
          >
            Back to Tenders
          </Link>
        </main>
      </div>
    );
  }

  const bidders = tender.bidders || [];
  const requirements = tender.requirements || [];

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white/85 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Tenders</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30">
              <FileText className="w-3 h-3" />
              Tender Overview &amp; Bidders
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Verify New Bidder</span>
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* ============================================================
              1. TENDER SUMMARY CARD
             ============================================================ */}
          <div className="premium-card p-6 sm:p-7 rounded-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                    {tender.tenderReference || 'TND-REF'}
                  </span>
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created: {new Date(tender.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  <span>•</span>
                  <span>Doc: {tender.documentRef}</span>
                  {tender.documents && tender.documents.length > 1 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30">
                      {tender.documents.length} Tender PDFs Combined
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {tender.title}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                  Issuing Department / Buyer: {tender.organization}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                <div className="text-right sm:text-left bg-slate-50 dark:bg-[#071224] p-3 rounded-xl border border-slate-200 dark:border-blue-500/15">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Bidders</p>
                  <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {bidders.length} verified
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#071224] p-3 rounded-xl border border-slate-200 dark:border-blue-500/15">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Requirements</p>
                  <p className="text-xl font-bold font-mono text-blue-600 dark:text-cyan-400">
                    {requirements.length} criteria
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              2. VERIFICATION HISTORY (MULTIPLE BIDDERS FOR THIS TENDER)
              Requirement 8
             ============================================================ */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Verification History ({bidders.length} Bidders)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  All bidders evaluated independently against this tender’s requirements
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bidder</span>
              </button>
            </div>

            {bidders.length === 0 ? (
              <div className="premium-card p-8 rounded-2xl text-center border-dashed border-slate-300 dark:border-blue-500/30">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  No Bidders Verified for this Tender Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  Upload a bidder qualification PDF to compare it clause-by-clause against this tender and compute compliance and risk scores.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Verify First Bidder</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bidders.map((b) => (
                  <Link
                    key={b.id}
                    href={`/verifications/${b.id}`}
                    className="group premium-card p-5 rounded-2xl relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:border-blue-500/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                            {b.bidderName}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            Doc: {b.bidderDocumentRef}
                          </p>
                        </div>
                        <RiskBadge level={b.riskLevel} size="sm" />
                      </div>

                      {/* Scores display adhering to Requirement 8 */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071224] border border-slate-100 dark:border-blue-500/15 grid grid-cols-2 gap-2 text-center my-3">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">Compliance</p>
                          <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {b.compliancePercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">Risk Score</p>
                          <p className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                            {b.riskScore}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {b.aiSummary}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-cyan-400">
                      <span>Open AI Verification Report</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ============================================================
              3. TENDER REQUIREMENTS (ISOLATED TO THIS TENDER)
             ============================================================ */}
          <section className="premium-card rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-blue-500/15 flex items-center justify-between bg-slate-50/50 dark:bg-[#071224]/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Tender Requirements Baseline ({requirements.length} Criteria)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Evaluation rules extracted specifically for this tender. All bidders are compared against these clauses.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-blue-500/10">
              {requirements.map((req, idx) => (
                <div key={req.id || idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 table-row-hover">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {req.name}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {req.category}
                      </span>
                      {req.mandatory && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {req.description}
                    </p>
                    {req.tenderClauseExcerpt && (
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#040c18] p-2 rounded border border-slate-100 dark:border-blue-500/10">
                        Excerpt: &ldquo;{req.tenderClauseExcerpt}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-500/20">
                      Weight: {req.weight}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Raw Text Viewer */}
          <div className="premium-card rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full px-6 py-4 flex items-center justify-between text-left text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-blue-500/5 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Inspect Raw Extracted Tender Text
              </span>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showRawText && (
              <div className="p-6 border-t border-slate-200 dark:border-blue-500/15 bg-slate-50 dark:bg-[#040c18]">
                <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
                  {tender.extractedText || 'No text content available.'}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="premium-card rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verify Bidder Against This Tender
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluating against: {tender.title}
                  </p>
                </div>
              </div>

              {/* Sample loader bar for quick testing */}
              <div className="mb-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-cyan-300 font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick Load Demonstration Bidder:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleBidder('compliant')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-50 cursor-pointer"
                  >
                    Compliant (ABC Tech)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleBidder('medium')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-50 cursor-pointer"
                  >
                    Medium Risk (XYZ Sol)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleBidder('high')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] font-semibold hover:bg-rose-50 cursor-pointer"
                  >
                    High Risk (PQR Sys)
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyBidder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bidder Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Technologies Pvt Ltd"
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <MultiPdfUpload
                  files={bidderFiles}
                  onChange={setBidderFiles}
                  isProcessing={verifying}
                  label="Bidder Document PDFs (.pdf)"
                  hint="Select or drag & drop 1–10 Bidder PDFs (Max 25MB each)"
                  accentColor="emerald"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Or Paste Bidder Clauses / Submittal Text
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste bidder credential text, GSTIN details, turnover excerpts, etc."
                    value={bidderText}
                    onChange={(e) => setBidderText(e.target.value)}
                    className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl text-white disabled:opacity-50 cursor-pointer"
                  >
                    {verifying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 animate-spin border-t-white rounded-full" />
                        <span>Running Comparative Audit...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Run Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
