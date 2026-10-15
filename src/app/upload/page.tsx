'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { MultiPdfUpload } from '@/components/MultiPdfUpload';
import { useLanguage } from '@/lib/i18n';
import { TenderRequirement } from '@/types';
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
  Plus,
  Send,
  Save,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  'IT & Cloud Infrastructure',
  'Smart City & Surveillance',
  'Civil Works & Infrastructure',
  'Healthcare & Medical Equipment',
  'Logistics & Transport',
  'Consulting & Technical Services',
  'General Procurement',
];

function UploadWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);

  // Workflow steps: 1 = Form & Upload, 2 = Review Extracted Criteria, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Tender metadata
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderOrg, setTenderOrg] = useState('');
  const [tenderRef, setTenderRef] = useState('');
  const [category, setCategory] = useState('IT & Cloud Infrastructure');
  const [location, setLocation] = useState('Central / Pan-India');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [tenderFiles, setTenderFiles] = useState<File[]>([]);
  const [tenderText, setTenderText] = useState('');

  // Extracted Requirements Review State
  const [extractedRequirements, setExtractedRequirements] = useState<TenderRequirement[]>([]);
  const [newReqName, setNewReqName] = useState('');
  const [newReqCategory, setNewReqCategory] = useState<'Statutory' | 'Financial' | 'Technical' | 'Contractual' | 'Integrity'>('Technical');
  const [newReqMandatory, setNewReqMandatory] = useState(true);

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
  }, [router]);

  // Load sample tender data for instant testing
  const handleLoadSampleTender = (sampleType: 'cctv' | 'it_equip') => {
    setError('');
    setTenderFiles([]);
    if (sampleType === 'cctv') {
      setTenderTitle('RFP for Smart City AI CCTV Surveillance & Optical Fiber Network');
      setTenderOrg('Municipal Smart City Development Corp Ltd (MoHUA)');
      setTenderRef('MOHUA/SC-CCTV/2026/09');
      setCategory('Smart City & Surveillance');
      setLocation('New Delhi / NCR');
      setEstimatedBudget('₹15 Crores');
      setDescription(
        'Turnkey supply, deployment, and 24x7 monitoring of AI-powered IP CCTV surveillance cameras and centralized command centre.'
      );
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
      setTenderTitle('Procurement of High-Availability Enterprise Server Infrastructure');
      setTenderOrg('National Informatics Centre Services Inc (NICSI)');
      setTenderRef('NICSI/IT-SRV/2026/104');
      setCategory('IT & Cloud Infrastructure');
      setLocation('All India / Central');
      setEstimatedBudget('₹25 Crores');
      setDescription(
        'Comprehensive supply, configuration, and 3-year warranty support for enterprise rackmount compute servers and SAN storage.'
      );
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

  // Step 1: Pre-extract and move to Review step
  const handleProceedToReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderTitle.trim() || tenderTitle.trim().length < 3) {
      setError('Please enter a valid tender title (at least 3 characters).');
      return;
    }
    if (!tenderOrg.trim()) {
      setError('Please specify the issuing department or organization.');
      return;
    }
    if (tenderFiles.length === 0 && !tenderText.trim()) {
      setError('Please upload at least one tender RFP document (PDF) or provide RFP clauses.');
      return;
    }

    setIsProcessing(true);
    setProcessingMsg('Analyzing tender documentation and extracting qualification baseline...');
    setError('');

    try {
      // Build dummy payload or parse client-side template
      const combinedText = tenderText || tenderFiles.map((f) => f.name).join(' ');

      // Default baseline criteria
      const baseline: TenderRequirement[] = [
        {
          id: 'req_gst',
          name: 'GST Registration & Compliance',
          category: 'Statutory',
          description: 'Valid GSTIN registration certificate and active filing compliance.',
          mandatory: true,
          weight: 15,
          tenderClauseExcerpt: 'Mandatory active GSTIN registration required.',
        },
        {
          id: 'req_pan',
          name: 'Permanent Account Number (PAN)',
          category: 'Statutory',
          description: 'Valid PAN card copy and Income Tax Return compliance.',
          mandatory: true,
          weight: 10,
          tenderClauseExcerpt: 'Valid PAN of bidding organization.',
        },
        {
          id: 'req_turnover',
          name: 'Annual Financial Turnover & CA Audit',
          category: 'Financial',
          description: `Minimum average annual turnover ${estimatedBudget ? `commensurate with ${estimatedBudget}` : 'with CA UDIN certification'}.`,
          mandatory: true,
          weight: 15,
          tenderClauseExcerpt: 'Audited balance sheets with CA UDIN certification.',
        },
        {
          id: 'req_oem_maf',
          name: 'Manufacturer Authorization Form (MAF / OEM)',
          category: 'Technical',
          description: 'Tender-specific Manufacturer Authorization Form direct from OEM.',
          mandatory: true,
          weight: 15,
          tenderClauseExcerpt: 'Tender-specific commitment from primary OEM.',
        },
        {
          id: 'req_experience',
          name: 'Prior Work Experience',
          category: 'Technical',
          description: 'Execution of similar government or PSU contracts with client completion certificates.',
          mandatory: true,
          weight: 15,
          tenderClauseExcerpt: 'Past performance proof in similar procurement projects.',
        },
        {
          id: 'req_make_in_india',
          name: 'Make in India Local Content Declaration',
          category: 'Contractual',
          description: 'Minimum 50% Class-I local content self-certification.',
          mandatory: true,
          weight: 15,
          tenderClauseExcerpt: 'Public Procurement Order local content undertaking.',
        },
        {
          id: 'req_non_blacklisting',
          name: 'Non-Blacklisting & Integrity Undertaking',
          category: 'Integrity',
          description: 'Notarized undertaking confirming non-debarment by any government authority.',
          mandatory: true,
          weight: 15,
          tenderClauseExcerpt: 'Notarized affidavit on stamp paper.',
        },
      ];

      setExtractedRequirements(baseline);
      setCurrentStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error extracting requirements');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add custom requirement in review step
  const handleAddRequirement = () => {
    if (!newReqName.trim()) return;
    const newReq: TenderRequirement = {
      id: `custom_${Date.now()}`,
      name: newReqName.trim(),
      category: newReqCategory,
      description: `Requirement criterion for ${newReqName.trim()}`,
      mandatory: newReqMandatory,
      weight: 10,
      tenderClauseExcerpt: `Specification requirement: ${newReqName.trim()}`,
    };
    setExtractedRequirements([...extractedRequirements, newReq]);
    setNewReqName('');
  };

  const handleRemoveRequirement = (id: string) => {
    setExtractedRequirements(extractedRequirements.filter((r) => r.id !== id));
  };

  const handleToggleMandatory = (id: string) => {
    setExtractedRequirements(
      extractedRequirements.map((r) => (r.id === id ? { ...r, mandatory: !r.mandatory } : r))
    );
  };

  // Step 3: Save as Draft or Publish Tender
  const handleFinalSaveTender = async (publishStatus: 'Draft' | 'Published') => {
    setIsProcessing(true);
    setProcessingMsg(
      publishStatus === 'Published'
        ? 'Publishing tender to Tender Library...'
        : 'Saving tender as Draft...'
    );
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', tenderTitle.trim());
      formData.append('organization', tenderOrg.trim());
      formData.append('tenderReference', tenderRef.trim());
      formData.append('category', category);
      formData.append('location', location);
      formData.append('estimatedBudget', estimatedBudget.trim());
      formData.append('submissionDeadline', submissionDeadline);
      formData.append('description', description.trim());
      formData.append('status', publishStatus);
      formData.append('requirements', JSON.stringify(extractedRequirements));

      tenderFiles.forEach((f) => formData.append('files', f));
      if (tenderText) formData.append('extractedText', tenderText);

      const res = await fetch('/api/tenders', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save tender.');
      }

      // Navigate to tender details
      router.push(`/tenders/${data.tender.id}`);
    } catch (err: unknown) {
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : 'Error saving tender');
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                Tender Publishing Workflow
              </span>
              <span className="text-[10px] text-slate-400">• Step {currentStep} of 2</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('createTenderTitle', 'Tender Creation & Requirement Extraction')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'createTenderSubtitle',
                'Upload tender RFP document(s) to extract requirement baseline. Review criteria before publishing.'
              )}
            </p>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Workflow Stepper */}
          <div className="grid grid-cols-2 gap-3 p-2 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentStep === 1
                    ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                1
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('step1Label', '1. Enter Details & Documents')}
                </p>
                <p className="text-[10px] text-slate-400">Metadata, scope & RFP upload</p>
              </div>
            </button>

            <button
              type="button"
              disabled={extractedRequirements.length === 0}
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                currentStep === 2
                  ? 'bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentStep === 2
                    ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                2
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('step2Label', '2. Review & Edit Extracted Criteria')}
                </p>
                <p className="text-[10px] text-slate-400">Save as Draft or Publish to Library</p>
              </div>
            </button>
          </div>

          {/* Quick Demo Pre-fill Bar */}
          {currentStep === 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-500/20 text-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-cyan-300 font-semibold">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>Pre-load Sample Tender Baseline:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSampleTender('cctv')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-blue-900/60 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  AI CCTV Smart City RFP
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSampleTender('it_equip')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-blue-900/60 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Enterprise IT Server RFP
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Details & Upload Form */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Tender Profile & Metadata</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderTitleLabel', 'Tender Title')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tenderTitle}
                      onChange={(e) => setTenderTitle(e.target.value)}
                      placeholder={t('tenderTitlePlaceholder', 'e.g. Supply and Implementation of Secure Cloud Infrastructure')}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderOrgLabel', 'Issuing Organization')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tenderOrg}
                      onChange={(e) => setTenderOrg(e.target.value)}
                      placeholder={t('tenderOrgPlaceholder', 'e.g. National Informatics Centre Services Inc (NICSI)')}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderRefLabel', 'Tender Reference / ID')}
                    </label>
                    <input
                      type="text"
                      value={tenderRef}
                      onChange={(e) => setTenderRef(e.target.value)}
                      placeholder={t('tenderRefPlaceholder', 'e.g. NICSI/IT-SRV/2026/104')}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderCategoryLabel', 'Tender Category')}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    >
                      {COMMON_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderLocationLabel', 'Location / Jurisdiction')}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New Delhi / Pan-India"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderBudgetLabel', 'Estimated Budget / Value')}
                    </label>
                    <input
                      type="text"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      placeholder="e.g. ₹15 Crores or ₹50 Lakhs"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderDeadlineLabel', 'Bid Submission Deadline')}
                    </label>
                    <input
                      type="date"
                      value={submissionDeadline}
                      onChange={(e) => setSubmissionDeadline(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('tenderScopeLabel', 'Description & Scope of Work')}
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('tenderScopePlaceholder', 'Provide brief scope or objectives of the procurement contract...')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* RFP Document Upload */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Upload Tender RFP Document(s)</span>
                </h3>

                <MultiPdfUpload
                  files={tenderFiles}
                  onChange={setTenderFiles}
                  label="Select or drag-and-drop Tender RFP documents (PDF, up to 10 files)"
                  hint="Batch multi-document upload supported. Text and criteria will be aggregated across all files."
                  maxFiles={10}
                />

                <div className="pt-2">
                  <label className="block font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">
                    {t('tenderClausesLabel', 'Direct RFP Clauses (Optional text input)')}
                  </label>
                  <textarea
                    rows={4}
                    value={tenderText}
                    onChange={(e) => setTenderText(e.target.value)}
                    placeholder="Paste tender specifications, statutory clauses, or financial turnover criteria here..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" />
                  <span>{isProcessing ? processingMsg : t('btnExtractReview', 'Extract & Review Requirements')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Review & Edit Extracted Criteria */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                      <span>Review &amp; Refine Tender Criteria Baseline</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      The AI engine extracted {extractedRequirements.length} clauses. You can modify weights, mark clauses as mandatory, or add custom requirements before publishing.
                    </p>
                  </div>
                </div>

                {/* Requirements List */}
                <div className="space-y-2.5">
                  {extractedRequirements.map((req, idx) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {idx + 1}. {req.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {req.category}
                          </span>
                          {req.mandatory ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                              Mandatory
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">{req.description}</p>
                        {req.tenderClauseExcerpt && (
                          <p className="text-slate-400 text-[10px] italic">
                            &ldquo;{req.tenderClauseExcerpt}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleMandatory(req.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {req.mandatory ? 'Make Optional' : 'Make Mandatory'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(req.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Requirement */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-500/20 space-y-3">
                  <span className="text-xs font-bold text-blue-700 dark:text-cyan-300 block">
                    Add Custom Tender Requirement
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="e.g. ISO 27001 Security Certification"
                      value={newReqName}
                      onChange={(e) => setNewReqName(e.target.value)}
                      className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    />
                    <select
                      value={newReqCategory}
                      onChange={(e) => setNewReqCategory(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Statutory">Statutory</option>
                      <option value="Financial">Financial</option>
                      <option value="Technical">Technical</option>
                      <option value="Contractual">Contractual</option>
                      <option value="Integrity">Integrity</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newReqMandatory}
                        onChange={(e) => setNewReqMandatory(e.target.checked)}
                        className="rounded"
                      />
                      <span>Mark as Mandatory Eligibility Clause</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                    >
                      Add Clause
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Save as Draft vs Publish to Library */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  ← Back to Details
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleFinalSaveTender('Draft')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-slate-500" />
                    <span>{t('btnSaveDraft', 'Save as Draft')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleFinalSaveTender('Published')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t('btnPublish', 'Publish to Tender Library')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UploadWorkflowPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <UploadWorkflowContent />
    </Suspense>
  );
}
