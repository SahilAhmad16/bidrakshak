'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { VerificationReport, OfficerDecision, VerificationStatus } from '@/types';
import { useLanguage } from '@/lib/i18n';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  Printer,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Send,
  AlertCircle,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  HelpCircle,
  BadgeAlert,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function VerificationReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { t, language } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Officer Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionStatus, setDecisionStatus] = useState<'Approved' | 'Rejected' | 'Needs Clarification'>('Approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionRecorded, setDecisionRecorded] = useState<OfficerDecision | null>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {});

    fetch(`/api/verifications/${resolvedParams.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Verification audit report not found.');
        return res.json();
      })
      .then((data) => {
        if (data && data.verification) {
          setReport(data.verification);
          if (data.verification.feedback?.rating) {
            setFeedbackRating(data.verification.feedback.rating);
            setFeedbackComment(data.verification.feedback.comment || '');
            setFeedbackSubmitted(true);
          }
          if (data.verification.officerDecision) {
            setDecisionRecorded(data.verification.officerDecision);
          }
        }
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err.message || 'Failed to retrieve verification report.');
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleOfficerDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report?.applicationId) {
      alert('This verification report is not linked to a specific tender application.');
      return;
    }

    setDecisionSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${report.applicationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decisionStatus,
          remarks: decisionRemarks.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to record decision.');
      }

      const resData = await res.json();
      setDecisionRecorded(resData.decision);
      setDecisionModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error submitting decision');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackRating) {
      setFeedbackError('Please select whether this verification was helpful or not helpful.');
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackError('');

    try {
      const res = await fetch(`/api/verifications/${resolvedParams.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit feedback.');
      }

      setFeedbackSubmitted(true);
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : 'Error recording feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'Compliant':
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3" />
            {t('statusCompliant', 'Compliant')}
          </span>
        );
      case 'Non-Compliant':
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25">
            <X className="w-3 h-3" />
            {t('statusNonCompliant', 'Non-Compliant')}
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
            <Clock className="w-3 h-3" />
            {t('statusExpired', 'Expired Document')}
          </span>
        );
      case 'Mismatch Detected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25">
            <AlertTriangle className="w-3 h-3" />
            {t('statusMismatch', 'Mismatch Detected')}
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            <AlertCircle className="w-3 h-3" />
            {t('statusMissing', 'Missing Evidence')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/25">
            <HelpCircle className="w-3 h-3" />
            {t('statusNeedsReview', 'Needs Review')}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-base)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500" />
          <p className="text-xs text-slate-500">Loading audit findings &amp; verification report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar userName={user?.name} userEmail={user?.email} />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Report Not Found</h2>
            <p className="text-xs text-slate-500">{error || 'Verification report could not be retrieved.'}</p>
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

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200 print:bg-white print:text-black">
      <div className="print:hidden">
        <Sidebar userName={user?.name} userEmail={user?.email} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href={`/tenders/${report.tenderId}`}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                  {report.tenderReference || 'GOV-AUDIT'}
                </span>
                <span className="text-[10px] text-slate-400">• Report ID: {report.id}</span>
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {t('reportTitle', 'Procurement Verification & Compliance Report')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report.applicationId && (
              <button
                type="button"
                onClick={() => setDecisionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('btnReviewDecision', 'Record Final Decision')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('btnExportReport', 'Export / Print')}</span>
            </button>
          </div>
        </header>

        {/* Report Content Body */}
        <div className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Outdated Notice Banner */}
          {report.isOutdated && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between gap-3 text-xs text-purple-700 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 shrink-0 text-purple-500 animate-spin" />
                <span>
                  <strong>Evidence Updated:</strong> Bidder documents have been modified since this report was generated. Re-verification is recommended.
                </span>
              </div>
              {report.applicationId && (
                <Link
                  href={`/tenders/${report.tenderId}`}
                  className="px-3 py-1 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
                >
                  Go to Re-verify
                </Link>
              )}
            </div>
          )}

          {/* Critical Risk / Mandatory Failure Banner */}
          {report.hasCriticalFailure && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
              <BadgeAlert className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm">Critical Mandatory Clause Failure Detected</strong>
                <p className="mt-0.5 leading-relaxed">
                  One or more mandatory tender requirements (GST, PAN, Turnover, MAF, or Non-blacklisting) failed or were omitted in this submission. In accordance with procurement guidelines, high compliance cannot be awarded.
                </p>
              </div>
            </div>
          )}

          {/* Procurement Officer Decision Banner if already recorded */}
          {decisionRecorded && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Official Decision: {decisionRecorded.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Officer: {decisionRecorded.officerName} ({new Date(decisionRecorded.decidedAt).toLocaleString()})
                </span>
              </div>
              {decisionRecorded.remarks && (
                <p className="text-slate-600 dark:text-slate-400 pl-6 italic">
                  &ldquo;{decisionRecorded.remarks}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Dossier Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tender & Bidder Info */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Target Tender
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {report.tenderTitle}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{report.tenderOrganization}</span>
                  <span>•</span>
                  <span>Ref: {report.tenderReference}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Bidder Organization
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {report.bidderName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Evidence Submittal
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px] block">
                    {report.bidderDocumentRef || 'Attached Documents'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Audit Timestamp
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(report.submittedAt || report.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance & Risk Gauge */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('complianceScoreLabel', 'Compliance Score')}
                </span>
                <RiskBadge level={report.riskLevel} />
              </div>

              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {report.complianceScore}
                </span>
                <span className="text-slate-400 text-sm font-semibold">/ 100</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('riskScoreLabel', 'Risk Index')}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {report.riskScore}/100 ({report.riskLevel} RISK)
                </span>
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-cyan-300">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>AI Comparative Audit Executive Summary</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{report.aiSummary}</p>
          </div>

          {/* Transparency & Authenticity Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                {t('authenticitySectionTitle', 'Document Authenticity & Extraction Transparency')}
              </strong>
              <p>
                {report.authenticityStatement ||
                  t(
                    'authenticityNotice',
                    'Documents analyzed via AI text extraction and structural pattern recognition. External registry checks: Unofficial autonomous validation.'
                  )}
              </p>
            </div>
          </div>

          {/* Clause-by-Clause Comparison Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>{t('clauseComparisonTitle', 'Clause-by-Clause Tender vs Bidder Evaluation')}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3 px-3">{t('colRequirement', 'Tender Requirement')}</th>
                    <th className="pb-3 px-3">{t('colCategory', 'Category')}</th>
                    <th className="pb-3 px-3">{t('colEvidence', 'Bidder Evidence')}</th>
                    <th className="pb-3 px-3">{t('colStatus', 'Status')}</th>
                    <th className="pb-3 px-3 text-right">{t('colScore', 'Score')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {report.comparisonResults.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 align-top">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {item.tenderRequirement}
                        </span>
                        {item.remarks && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 italic">
                            {item.remarks}
                          </span>
                        )}
                        {item.pageReference && (
                          <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold block mt-0.5">
                            Source: {item.sourceDocument || 'Doc'} ({item.pageReference})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top text-slate-700 dark:text-slate-300 max-w-xs">
                        <p className="line-clamp-3 text-[11px] leading-relaxed">
                          {item.bidderEvidence}
                        </p>
                        {item.extractedValue && (
                          <span className="inline-block px-1.5 py-0.5 mt-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                            Extracted: {item.extractedValue}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-3 align-top text-right font-bold text-slate-800 dark:text-slate-200">
                        {item.scoreAwarded} / {item.weight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations & Corrective Actions */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Recommendations &amp; Action Items</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                {report.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-3 print:hidden">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Was this AI compliance audit helpful?
            </h3>

            {feedbackSubmitted ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Thank you! Your feedback has been recorded.
              </p>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackRating('helpful')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      feedbackRating === 'helpful'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackRating('not_helpful')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      feedbackRating === 'not_helpful'
                        ? 'bg-red-500/10 border-red-500 text-red-600'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Needs Improvement
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Optional remarks on verification accuracy..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 resize-none"
                />

                {feedbackError && <p className="text-red-500 text-[11px]">{feedbackError}</p>}

                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* OFFICER DECISION MODAL */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="w-full max-w-lg bg-white dark:bg-[#071224] rounded-2xl border border-slate-200 dark:border-blue-500/25 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>{t('officerDecisionTitle', 'Authorized Procurement Officer Decision')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setDecisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOfficerDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Qualification Decision:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionStatus('Approved')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      decisionStatus === 'Approved'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Qualified / Approved
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionStatus('Rejected')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      decisionStatus === 'Rejected'
                        ? 'bg-red-500/10 border-red-500 text-red-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Disqualified / Rejected
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionStatus('Needs Clarification')}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      decisionStatus === 'Needs Clarification'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Needs Clarification
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('decisionRemarksLabel', 'Official Decision Remarks & Justification')}:
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder="Record formal procurement justification, committee approval notes, or grounds for disqualification..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={decisionSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {decisionSubmitting ? 'Recording...' : t('btnRecordDecision', 'Submit Officer Decision')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
