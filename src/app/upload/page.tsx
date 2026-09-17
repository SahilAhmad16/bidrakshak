'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { MultiPdfUpload } from '@/components/MultiPdfUpload';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  Tag,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  UserCheck,
  Plus,
} from 'lucide-react';
import { TenderRecord } from '@/types';

function UploadWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'create_tender' | 'verify_bidder'>('create_tender');
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [tenders, setTenders] = useState<TenderRecord[]>([]);

  // Tender creation form state
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderOrg, setTenderOrg] = useState('');
  const [tenderRef, setTenderRef] = useState('');
  const [tenderFiles, setTenderFiles] = useState<File[]>([]);
  const [tenderText, setTenderText] = useState('');

  // Bidder verification form state
  const [selectedTenderId, setSelectedTenderId] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [bidderFiles, setBidderFiles] = useState<File[]>([]);
  const [bidderText, setBidderText] = useState('');

  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

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

    fetch('/api/tenders')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.tenders) {
          setTenders(data.tenders);
          const queryTenderId = searchParams.get('tenderId');
          if (queryTenderId) {
            setSelectedTenderId(queryTenderId);
            setActiveTab('verify_bidder');
          } else if (data.tenders.length > 0) {
            setSelectedTenderId(data.tenders[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [router, searchParams]);

  // Handle Load Sample Tender
  const handleLoadSampleTender = (sampleType: 'cctv' | 'it_equip') => {
    setError('');
    setActiveTab('create_tender');
    setTenderFiles([]);
    if (sampleType === 'cctv') {
      setTenderTitle('RFP for Smart City AI CCTV Surveillance & Optical Fiber Network');
      setTenderOrg('Municipal Smart City Development Corp Ltd (MoHUA)');
      setTenderRef('MOHUA/SC-CCTV/2026/09');
      setTenderText(`GOVERNMENT OF INDIA - MINISTRY OF HOUSING AND URBAN AFFAIRS
TENDER REFERENCE: MOHUA/SC-CCTV/2026/09
PROJECT: Supply, Installation, Testing & Commissioning of AI CCTV Surveillance System.
1. STATUTORY CRITERIA: Bidder must possess valid GST Registration (GSTIN) and PAN.
2. MSME BENEFITS: Micro and Small Enterprises registered under Udyam are exempt from EMD.
3. FINANCIAL CAPACITY: Minimum average annual turnover of INR 15 Crores during last 3 financial years. Audited balance sheets with CA UDIN certification required.
4. OEM AUTHORIZATION: Tender-specific Manufacturer Authorization Form (MAF) from OEM required for IP cameras.
5. LOCAL CONTENT: In accordance with Make in India Public Procurement Order, minimum 50% Class-I local content required.
6. PRIOR EXPERIENCE: Bidder must have executed at least 3 similar smart surveillance projects for Government or PSU bodies.
7. INTEGRITY PACT: Bidder must submit notarized Non-Debarment and Non-Blacklisting undertaking.`);
    } else {
      setTenderTitle('Procurement of IT Equipment and Enterprise Server Infrastructure');
      setTenderOrg('National Informatics Centre Services Inc (NICSI)');
      setTenderRef('NICSI/IT-SRV/2026/104');
      setTenderText(`NATIONAL INFORMATICS CENTRE SERVICES INC
TENDER REFERENCE: NICSI/IT-SRV/2026/104
TENDER FOR: Supply and Implementation of High-Availability IT Equipment and Servers.
1. GSTIN & PAN: Active GST registration with 12 months filing proof and valid PAN card.
2. FINANCIAL QUALIFICATION: Average annual turnover not less than INR 25 Crores in last 3 financial years. CA audit certificate with UDIN mandatory.
3. OEM AUTHORIZATION: Tender-specific Manufacturer Authorization Form (MAF) from server OEM.
4. LABOR COMPLIANCE: Proof of valid EPFO and ESIC registrations with recent payment challans.
5. WORK EXPERIENCE: Bidder must have completed at least 2 similar data center or server deployment contracts.
6. PUBLIC PROCUREMENT ORDER: Minimum 50% Local Content self-declaration.
7. INTEGRITY DECLARATION: Notarized affidavit stating non-blacklisting by any state or central government entity.`);
    }
  };

  // Handle Load Sample Bidder
  const handleLoadSampleBidder = (bidderType: 'compliant' | 'medium' | 'high') => {
    setError('');
    setActiveTab('verify_bidder');
    setBidderFiles([]);
    if (bidderType === 'compliant') {
      setBidderName('ABC Technologies Pvt Ltd');
      setBidderText(`BIDDER QUALIFICATION DOSSIER
Bidder: ABC Technologies Pvt Ltd
1. GST REGISTRATION: Active GSTIN 27ABCDE1234F1Z5 with verified GSTR-3B filings.
2. PAN: Valid PAN AAACA9999P with 3 years ITR-V acknowledgments.
3. COMPANY REGISTRATION: Certificate of Incorporation CIN: U72200MH2016PTC284910.
4. MSME STATUS: Udyam Registration UDYAM-MH-02-0012345 attached.
5. FINANCIALS: Average annual turnover of INR 18.5 Crores with CA UDIN: 26045812BKRLPX8819.
6. OEM MAF: Tender-specific Manufacturer Authorization Form attached from OEM.
7. EXPERIENCE: Attached 3 Government project completion certificates.
8. MAKE IN INDIA: Declares 65% Class-I Local Content.
9. INTEGRITY: Notarized Non-Blacklisting affidavit on stamp paper.`);
    } else if (bidderType === 'medium') {
      setBidderName('XYZ Solutions & Systems');
      setBidderText(`BIDDER PROPOSAL
Bidder: XYZ Solutions & Systems
1. GSTIN: 07BBBBB5678G2Z1.
2. PAN: BBBBB5678G.
3. FINANCIALS: Annual turnover INR 9.2 Crores with balance sheets (UDIN number pending).
4. OEM MAF: Standard reseller letter attached; tender-specific MAF in process.
5. EXPERIENCE: 1 completed PSU work order attached.
6. MAKE IN INDIA: 45% local content estimated.
7. NON-BLACKLISTING: Declaration on company letterhead.`);
    } else {
      setBidderName('PQR Systems');
      setBidderText(`BIDDER SUBMISSION
Bidder: PQR Systems
Proposal for supply and implementation.
Company information provided upon request.
Financial capacity and experience details can be furnished post-qualification.`);
    }
  };

  // Submit Tender Creation
  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderTitle.trim() || tenderTitle.trim().length < 3) {
      setError('Please enter a tender title (at least 3 characters).');
      return;
    }
    if (!tenderOrg.trim()) {
      setError('Please specify the issuing department or organization.');
      return;
    }
    if (tenderFiles.length === 0 && !tenderText.trim()) {
      setError('Please upload at least one tender RFP PDF or provide tender requirement clauses.');
      return;
    }
    if (tenderFiles.length > 10) {
      setError('Maximum 10 tender PDF documents allowed per batch.');
      return;
    }

    setIsProcessing(true);
    setProcessingMsg(
      `Processing ${tenderFiles.length > 0 ? tenderFiles.length + ' tender document(s)' : 'clauses'} and extracting requirement baseline...`
    );
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', tenderTitle.trim());
      formData.append('organization', tenderOrg.trim());
      formData.append('tenderReference', tenderRef.trim());
      tenderFiles.forEach((f) => formData.append('files', f));
      if (tenderText) formData.append('extractedText', tenderText);

      const res = await fetch('/api/tenders', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create tender.');
      }

      router.push(`/tenders/${data.tender.id}`);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : 'Error creating tender';
      setError(msg);
    }
  };

  // Submit Bidder Verification
  const handleVerifyBidder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderId) {
      setError('Please select a target tender to verify the bidder against.');
      return;
    }
    if (!bidderName.trim()) {
      setError('Please enter the bidder organization name.');
      return;
    }
    if (bidderFiles.length === 0 && !bidderText.trim()) {
      setError('Please upload at least one bidder PDF document or provide submission text.');
      return;
    }
    if (bidderFiles.length > 10) {
      setError('Maximum 10 bidder PDF documents allowed per batch.');
      return;
    }

    setIsProcessing(true);
    setProcessingMsg(
      `Processing ${bidderFiles.length > 0 ? bidderFiles.length + ' bidder document(s)' : 'evidence'} and running comparative audit...`
    );
    setError('');

    try {
      const formData = new FormData();
      formData.append('bidderName', bidderName.trim());
      bidderFiles.forEach((f) => formData.append('files', f));
      if (bidderText) formData.append('extractedText', bidderText);

      const res = await fetch(`/api/tenders/${selectedTenderId}/bidders`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify bidder against tender.');
      }

      router.push(`/verifications/${data.verification.id}`);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : 'Error verifying bidder';
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                Procurement Workflow
              </span>
              <span className="text-[10px] text-slate-400">• SIH 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Tender &amp; Bidder Verification Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a Tender to extract isolated requirements, or verify multiple Bidders independently against a Tender
            </p>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Quick Demo Pre-fill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-500/20 text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-cyan-300 font-semibold">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Load SIH 2026 Test Demonstrations:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSampleTender('cctv')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-blue-900/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-cyan-300 hover:bg-blue-50 font-medium transition-colors cursor-pointer text-[11px]"
              >
                Sample 1: CCTV Tender RFP
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleBidder('compliant')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 font-medium transition-colors cursor-pointer text-[11px]"
              >
                Sample 2: Compliant Bidder (ABC)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleBidder('high')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-rose-900/60 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-[11px]"
              >
                Sample 3: High Risk Bidder (PQR)
              </button>
            </div>
          </div>

          {/* Workflow Tabs */}
          <div className="premium-card p-1.5 rounded-2xl flex flex-col sm:flex-row items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('create_tender');
                setError('');
              }}
              className={`flex-1 w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create_tender'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-500/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Create Tender &amp; Extract Requirements</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('verify_bidder');
                setError('');
              }}
              className={`flex-1 w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'verify_bidder'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-500/10'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>2. Verify Bidder Against Tender</span>
            </button>
          </div>

          {/* Loading Animation */}
          {isProcessing ? (
            <div className="premium-card rounded-2xl p-10 text-center animate-fade-up">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Processing AI Procurement Engine
              </h3>
              <p className="text-xs text-slate-500">{processingMsg}</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/25 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-rose-700 dark:text-rose-300">{error}</span>
                </div>
              )}

              {/* TAB 1: CREATE TENDER */}
              {activeTab === 'create_tender' && (
                <form onSubmit={handleCreateTender} className="premium-card p-6 sm:p-8 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-blue-500/15">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Create New Procurement Tender
                      </h2>
                      <p className="text-xs text-slate-500">
                        Upload the RFP / NIT document. The AI extracts this tender’s isolated requirements baseline.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tender Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RFP for Smart City Integrated Surveillance Network"
                        value={tenderTitle}
                        onChange={(e) => setTenderTitle(e.target.value)}
                        className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Issuing Department / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Municipal Development Corp / NICSI"
                        value={tenderOrg}
                        onChange={(e) => setTenderOrg(e.target.value)}
                        className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tender Reference ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MOHUA/SC-CCTV/2026/09"
                        value={tenderRef}
                        onChange={(e) => setTenderRef(e.target.value)}
                        className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <MultiPdfUpload
                    files={tenderFiles}
                    onChange={setTenderFiles}
                    isProcessing={isProcessing}
                    label="Upload Tender RFP / NIT Documents (.pdf)"
                    hint="Select or drag & drop 1–10 Tender RFP PDFs (Max 25MB each)"
                    accentColor="blue"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Or Paste Tender Requirement Clauses Directly
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste RFP eligibility criteria, turnover rules, OEM clauses, Make in India stipulations..."
                      value={tenderText}
                      onChange={(e) => setTenderText(e.target.value)}
                      className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white cursor-pointer shadow-xs"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Extract Requirements &amp; Create Tender</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: VERIFY BIDDER AGAINST TENDER */}
              {activeTab === 'verify_bidder' && (
                <form onSubmit={handleVerifyBidder} className="premium-card p-6 sm:p-8 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-blue-500/15">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Verify Bidder Against Selected Tender
                      </h2>
                      <p className="text-xs text-slate-500">
                        Evaluates the bidder’s credentials clause-by-clause against the selected tender’s requirements.
                      </p>
                    </div>
                  </div>

                  {tenders.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
                      No tenders found. Please switch to &ldquo;1. Create Tender&rdquo; first to define a tender baseline before verifying bidders.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Select Target Tender *
                        </label>
                        <select
                          required
                          value={selectedTenderId}
                          onChange={(e) => setSelectedTenderId(e.target.value)}
                          className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs font-medium"
                        >
                          {tenders.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.organization}) — {t.requirements?.length ?? 0} requirements
                            </option>
                          ))}
                        </select>
                      </div>

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
                        isProcessing={isProcessing}
                        label="Upload Bidder Submission Documents (.pdf)"
                        hint="Select or drag & drop 1–10 Bidder Submittal PDFs (Max 25MB each)"
                        accentColor="emerald"
                      />

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Or Paste Bidder Credential Text
                        </label>
                        <textarea
                          rows={5}
                          placeholder="Paste bidder GSTIN details, CA audited turnover statements, OEM MAF certifications..."
                          value={bidderText}
                          onChange={(e) => setBidderText(e.target.value)}
                          className="input-enterprise block w-full px-3 py-2 rounded-xl text-xs font-mono"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="submit"
                          className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl text-white cursor-pointer shadow-xs"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Run Comparative Verification Audit</span>
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading Workspace...</div>}>
      <UploadWorkflowContent />
    </Suspense>
  );
}
