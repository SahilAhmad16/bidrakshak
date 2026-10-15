'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { MultiPdfUpload } from '@/components/MultiPdfUpload';
import { TenderRecord, TenderApplication, VerificationReport } from '@/types';
import { useLanguage } from '@/lib/i18n';
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
  Send,
  Save,
  Clock,
  Tag,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  Play,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [tender, setTender] = useState<TenderRecord | null>(null);
  const [applications, setApplications] = useState<TenderApplication[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  // Apply Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [bidderName, setBidderName] = useState('');
  const [companyPan, setCompanyPan] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');
  const [companyUdyam, setCompanyUdyam] = useState('');
  const [companyTurnover, setCompanyTurnover] = useState('');
  const [bidderFiles, setBidderFiles] = useState<File[]>([]);
  const [bidderText, setBidderText] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appError, setAppError] = useState('');
  const [appSuccess, setAppSuccess] = useState('');

  // Verification Run State
  const [verifyingAppId, setVerifyingAppId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const fetchTenderDetails = async () => {
    try {
      const res = await fetch(`/api/tenders/${resolvedParams.id}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Tender record not found.');
      }
      const data = await res.json();
      if (data && data.tender) {
        setTender(data.tender);
        setIsCreator(!!data.isCreator);
        if (data.applications) setApplications(data.applications);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve tender.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          setBidderName(data.user.name || '');
        }
      })
      .catch(() => {});

    // Fetch user profile to prefill company info
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((pData) => {
        if (pData?.user) {
          if (pData.user.companyName) setBidderName(pData.user.companyName);
          if (pData.user.pan) setCompanyPan(pData.user.pan);
          if (pData.user.gstin) setCompanyGstin(pData.user.gstin);
          if (pData.user.udyamNumber) setCompanyUdyam(pData.user.udyamNumber);
        }
      })
      .catch(() => {});

    fetchTenderDetails();

    if (searchParams.get('apply') === 'true') {
      setApplyModalOpen(true);
    }
  }, [resolvedParams.id, searchParams]);

  // Handle Publish Tender (for creator)
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/tenders/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' }),
      });
      if (!res.ok) throw new Error('Failed to publish tender.');
      setTender((prev) => (prev ? { ...prev, status: 'Published' } : null));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error publishing tender');
    } finally {
      setPublishing(false);
    }
  };

  // Submit Bidder Application (Draft or Final)
  const handleApplySubmit = async (isDraft: boolean) => {
    if (!bidderName.trim()) {
      setAppError('Please enter the bidder / organization name.');
      return;
    }
    if (!isDraft && bidderFiles.length === 0 && !bidderText.trim()) {
      setAppError('Please attach at least one bid document (PDF) or furnish submission details.');
      return;
    }

    setSubmittingApp(true);
    setAppError('');
    setAppSuccess('');

    try {
      const formData = new FormData();
      formData.append('bidderName', bidderName.trim());
      formData.append('companyPan', companyPan.trim());
      formData.append('companyGstin', companyGstin.trim());
      formData.append('companyUdyam', companyUdyam.trim());
      formData.append('companyTurnover', companyTurnover.trim());
      formData.append('isDraft', isDraft ? 'true' : 'false');
      bidderFiles.forEach((file) => formData.append('files', file));
      if (bidderText) formData.append('extractedText', bidderText);

      const res = await fetch(`/api/tenders/${resolvedParams.id}/apply`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setAppSuccess(
        isDraft
          ? 'Application saved as Draft.'
          : 'Application submitted successfully! It is now queued for verification.'
      );

      // Refresh applications list
      fetchTenderDetails();

      setTimeout(() => {
        setApplyModalOpen(false);
        setAppSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setAppError(err instanceof Error ? err.message : 'Error submitting application');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Run On-Demand AI Verification on a submitted application
  const handleRunVerification = async (applicationId: string) => {
    setVerifyingAppId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}/verify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute verification audit.');
      }

      // Navigate directly to the generated verification audit report!
      router.push(`/verifications/${data.verification.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verification failed');
      setVerifyingAppId(null);
    }
  };

  const isDeadlinePassed = useMemo(() => {
    if (!tender?.submissionDeadline) return false;
    const d = new Date(tender.submissionDeadline);
    d.setHours(23, 59, 59, 999);
    return Date.now() > d.getTime();
  }, [tender?.submissionDeadline]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-base)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500" />
          <p className="text-xs text-slate-500">Loading tender specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar userName={user?.name} userEmail={user?.email} />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Unable to Load Tender</h2>
            <p className="text-xs text-slate-500">{error || 'Tender record not found.'}</p>
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Tender Library</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isDraft = tender.status === 'Draft';
  const isClosed = tender.status === 'Closed' || isDeadlinePassed;

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link
              href="/tenders"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                  {tender.tenderReference || 'TENDER SPEC'}
                </span>
                {isDraft ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
                    {t('statusDraft', 'Draft')}
                  </span>
                ) : isClosed ? (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-300 px-2 py-0.5 rounded-full">
                    {t('statusClosed', 'Closed')}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full">
                    {t('statusOpen', 'Open for Bids')}
                  </span>
                )}
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                {tender.title}
              </h1>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2">
            {isDraft && isCreator && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{publishing ? 'Publishing...' : t('btnPublish', 'Publish Tender')}</span>
              </button>
            )}

            {!isDraft && !isClosed && (
              <button
                type="button"
                onClick={() => setApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{t('btnApply', 'Apply for Tender')}</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">{t('departmentLabel', 'Issuing Organization')}</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {tender.organization}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                {tender.category && (
                  <div>
                    <span className="text-slate-400 block">{t('categoryLabel', 'Category')}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {tender.category}
                    </span>
                  </div>
                )}
                {tender.location && (
                  <div>
                    <span className="text-slate-400 block">{t('locationLabel', 'Location')}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {tender.location}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block">{t('budgetLabel', 'Estimated Value')}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block">
                    {tender.estimatedBudget || 'Not Disclosed'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('deadlineLabel', 'Deadline')}</span>
                  <span
                    className={`font-semibold mt-0.5 block ${
                      isClosed ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {tender.submissionDeadline || 'Open'}
                  </span>
                </div>
              </div>
            </div>

            {tender.description && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{t('tenderScopeLabel', 'Scope & Description')}:</p>
                <p className="leading-relaxed">{tender.description}</p>
              </div>
            )}
          </div>

          {/* Section: Tender Eligibility & Criteria Baseline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Mandatory &amp; Technical Eligibility Criteria ({tender.requirements?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Extracted clause-by-clause standard baseline against which all applicant bids are evaluated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(tender.requirements || []).map((req, idx) => (
                <div
                  key={req.id || idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {idx + 1}. {req.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      {req.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{req.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded ${
                        req.mandatory
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {req.mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                    <span className="text-slate-400 font-medium">Weight: {req.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section for Creator / Officer: Received Bidder Applications */}
          {isCreator && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    <span>Applicant Bidders &amp; Verification Queue ({applications.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Trigger AI verification audits on submitted bidder dossiers and record final procurement qualification decisions.
                  </p>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No bidder applications received yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Once published, eligible bidders can browse this tender in the Tender Library and submit their bids.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <th className="pb-3 px-3">Bidder Name</th>
                        <th className="pb-3 px-3">Submitted At</th>
                        <th className="pb-3 px-3">Attached Evidence</th>
                        <th className="pb-3 px-3">Audit Status</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {applications.map((app) => {
                        const isVerified = app.status === 'Verified';
                        const isAppVerifying = verifyingAppId === app.id;

                        return (
                          <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {app.bidderName}
                              {app.companyPan && (
                                <span className="block text-[10px] text-slate-400">PAN: {app.companyPan}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft'}
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                              {app.documents?.length || 0} document(s)
                            </td>
                            <td className="py-3 px-3">
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                                  <Clock className="w-3 h-3" />
                                  Awaiting Audit
                                </span>
                              )}
                              {app.isOutdated && (
                                <span className="ml-1 inline-flex items-center gap-0.5 text-[9px] text-purple-500 font-bold">
                                  (Re-audit Needed)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isAppVerifying}
                                  onClick={() => handleRunVerification(app.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {isAppVerifying ? (
                                    <>
                                      <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                                      <span>Auditing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3" />
                                      <span>{isVerified ? 'Re-verify' : t('btnRunVerification', 'Run Verification')}</span>
                                    </>
                                  )}
                                </button>

                                {(app.latestVerificationId || app.verificationReport) && (
                                  <Link
                                    href={`/verifications/${app.latestVerificationId || app.verificationReport?.id}`}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                                    title="View Audit Report"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* BIDDER APPLICATION MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#071224] rounded-2xl border border-slate-200 dark:border-blue-500/25 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-blue-500/15 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('applyModalTitle', 'Bidder Application Form')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Applying for: <span className="font-semibold text-slate-700 dark:text-slate-200">{tender.title}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {appSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{appSuccess}</span>
                </div>
              )}

              {appError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{appError}</span>
                </div>
              )}

              {/* Company Credentials */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  1. Company Identity &amp; Tax Identifiers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('bidderNameLabel', 'Bidder / Company Name')} *
                    </label>
                    <input
                      type="text"
                      value={bidderName}
                      onChange={(e) => setBidderName(e.target.value)}
                      required
                      placeholder="e.g. ABC Technologies Pvt Ltd"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('bidderPanLabel', 'Company PAN')}
                    </label>
                    <input
                      type="text"
                      value={companyPan}
                      onChange={(e) => setCompanyPan(e.target.value)}
                      placeholder="e.g. AAACA9999P"
                      maxLength={10}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 uppercase focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('bidderGstinLabel', 'Company GSTIN')}
                    </label>
                    <input
                      type="text"
                      value={companyGstin}
                      onChange={(e) => setCompanyGstin(e.target.value)}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      maxLength={15}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 uppercase focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('bidderUdyamLabel', 'Udyam / MSME Registration')}
                    </label>
                    <input
                      type="text"
                      value={companyUdyam}
                      onChange={(e) => setCompanyUdyam(e.target.value)}
                      placeholder="e.g. UDYAM-MH-02-0012345"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 uppercase focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Average Annual Turnover (INR)
                    </label>
                    <input
                      type="text"
                      value={companyTurnover}
                      onChange={(e) => setCompanyTurnover(e.target.value)}
                      placeholder="e.g. INR 18.5 Crores"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Supporting Documents */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  2. Upload Supporting Evidence &amp; Certificates (PDF)
                </span>
                <MultiPdfUpload
                  files={bidderFiles}
                  onChange={setBidderFiles}
                  label="Select or drag-and-drop Bid Submittal PDFs"
                  hint="Attach GST, PAN, CA Turnover statement, OEM MAF, Work Orders, and Make in India declarations."
                  maxFiles={10}
                />
              </div>

              {/* Direct Entry Clauses if any */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Evidence Text / Clause Excerpts (Optional)
                </label>
                <textarea
                  rows={3}
                  value={bidderText}
                  onChange={(e) => setBidderText(e.target.value)}
                  placeholder="Paste direct credentials, declaration statements, or work order references..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Mandatory Checklist Reminder */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>{t('mandatoryChecklistTitle', 'Mandatory Eligibility Clauses for this Tender')}</span>
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {(tender.requirements || [])
                    .filter((r) => r.mandatory)
                    .map((r) => (
                      <li key={r.id}>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{r.name}</span>
                        {r.category ? ` (${r.category})` : ''}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-blue-500/15 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {t('btnCancel', 'Cancel')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submittingApp}
                  onClick={() => handleApplySubmit(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('btnSaveDraft', 'Save Draft')}</span>
                </button>

                <button
                  type="button"
                  disabled={submittingApp}
                  onClick={() => handleApplySubmit(false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingApp ? 'Submitting...' : t('btnSubmitApplication', 'Submit Application')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
