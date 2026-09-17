'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { VerificationReport } from '@/types';
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
} from 'lucide-react';

export default function VerificationReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback State (Requirement 7)
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

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

    fetch(`/api/verifications/${resolvedParams.id}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
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
        }
      })
      .catch((err: Error) => {
        console.error(err);
        setError(err.message || 'Failed to retrieve verification report.');
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id, router]);

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
      const msg = err instanceof Error ? err.message : 'Error recording feedback';
      setFeedbackError(msg);
    } finally {
      setFeedbackSubmitting(false);
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
            Synthesizing AI Verification Audit Report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-base)]">
        <Sidebar userName={user?.name} userEmail={user?.email} />
        <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">Audit Report Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            {error || 'The requested bidder verification report could not be located.'}
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

  const compliantCount = report.compliantRequirements?.length ?? 0;
  const nonCompliantCount = report.nonCompliantRequirements?.length ?? 0;
  const missingCount = report.missingRequirements?.length ?? 0;
  const needsReviewCount = report.needsReview?.length ?? 0;

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white/85 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              href={`/tenders/${report.tenderId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tender</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
              <Layers className="w-3 h-3" />
              AI Verification Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-blue-500/20 rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <Link
              href={`/tenders/${report.tenderId}`}
              className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>View All Bidders</span>
            </Link>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-7">
          {/* ============================================================
              TENDER & BIDDER DETAILS CARD (Requirement 6)
             ============================================================ */}
          <div className="premium-card p-6 sm:p-7 rounded-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-blue-500/15">
              {/* Tender Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30">
                    Tender Baseline
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Ref: {report.tenderReference}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {report.tenderTitle}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                  Issuing Entity: {report.tenderOrganization}
                </p>
              </div>

              {/* Bidder Details */}
              <div className="space-y-2 md:pl-6 md:border-l md:border-slate-100 dark:md:border-blue-500/15">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Evaluated Bidder
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Doc: {report.bidderDocumentRef}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {report.bidderName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Audited on: {new Date(report.submittedAt || report.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                {report.documents && report.documents.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {report.documents.map((d, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 ${
                          d.status === 'Failed'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                            : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        }`}
                      >
                        📄 {d.fileName} ({d.status})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Verification Scores Banner (Requirement 4 & 5) */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071224] border border-slate-200 dark:border-blue-500/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Compliance Score
                </p>
                <p className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-cyan-400">
                  {report.complianceScore}<span className="text-base text-slate-400 font-normal">/100</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071224] border border-slate-200 dark:border-blue-500/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Compliance Percentage
                </p>
                <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {report.compliancePercentage}%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071224] border border-slate-200 dark:border-blue-500/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Risk Score
                </p>
                <p className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                  {report.riskScore}<span className="text-base text-slate-400 font-normal">/100</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071224] border border-slate-200 dark:border-blue-500/15 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Assigned Risk Level
                </p>
                <RiskBadge level={report.riskLevel} size="lg" />
              </div>
            </div>
          </div>

          {/* ============================================================
              REQUIREMENT BREAKDOWN STATS (Requirement 6)
             ============================================================ */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="premium-card p-4 rounded-xl text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requirements</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {report.totalRequirements}
              </p>
            </div>

            <div className="premium-card p-4 rounded-xl text-center border-emerald-500/20">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Compliant</p>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {compliantCount}
              </p>
            </div>

            <div className="premium-card p-4 rounded-xl text-center border-rose-500/20">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Non-Compliant</p>
              <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {nonCompliantCount}
              </p>
            </div>

            <div className="premium-card p-4 rounded-xl text-center border-amber-500/20">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Missing Documents</p>
              <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {missingCount}
              </p>
            </div>

            <div className="premium-card p-4 rounded-xl text-center border-blue-500/20 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">Needs Review</p>
              <p className="text-xl font-bold font-mono text-blue-600 dark:text-cyan-400 mt-1">
                {needsReviewCount}
              </p>
            </div>
          </div>

          {/* ============================================================
              AI SUMMARY & KEY RISK FACTORS (Requirement 6)
             ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 premium-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                      AI Verification Summary
                    </h3>
                    <span className="text-[10px] text-slate-500">Autonomous Evaluation Synthesis</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                  {report.aiSummary}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Audited under GFR 2017 &amp; CVC Procurement Heuristics
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-400">
                  Risk Level: {report.riskLevel}
                </span>
              </div>
            </div>

            <div className="premium-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                    Key Risk Factors ({report.keyRiskFactors?.length ?? 0})
                  </h3>
                  <span className="text-[10px] text-slate-500">Critical Concerns &amp; Discrepancies</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(report.keyRiskFactors?.length ?? 0) === 0 ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero critical compliance risk factors detected.</span>
                  </div>
                ) : (
                  report.keyRiskFactors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{rf}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              REQUIREMENT-WISE COMPARISON TABLE (Requirement 3 & 6)
              Tender Requirement → Bidder Evidence → Verification Status → Remarks
             ============================================================ */}
          <div className="premium-card rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-blue-500/15 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-[#071224]/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Requirement-by-Requirement Verification Comparison
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tender Requirement → Bidder Evidence → Verification Status → Remarks
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-slate-200 dark:border-blue-500/20">
                {report.comparisonResults?.length ?? 0} Evaluated Clauses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-blue-500/15 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#071224]/60">
                    <th className="py-3 px-6 w-1/4">Tender Requirement</th>
                    <th className="py-3 px-6 w-1/3">Bidder Evidence</th>
                    <th className="py-3 px-6 w-1/6">Verification Status</th>
                    <th className="py-3 px-6 w-1/4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10">
                  {report.comparisonResults?.map((item) => (
                    <tr key={item.id} className="table-row-hover">
                      <td className="py-3.5 px-6 align-top">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.tenderRequirement}
                        </div>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 align-top">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-50/80 dark:bg-[#040c18] p-2.5 rounded-lg border border-slate-100 dark:border-blue-500/10">
                          {item.bidderEvidence}
                        </p>
                      </td>

                      <td className="py-3.5 px-6 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === 'Compliant'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              : item.status === 'Needs Review'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                          }`}
                        >
                          {item.status === 'Compliant' && <Check className="w-3 h-3 stroke-[2.5]" />}
                          {item.status === 'Needs Review' && <AlertTriangle className="w-3 h-3 stroke-[2.5]" />}
                          {item.status === 'Missing' && <X className="w-3 h-3 stroke-[2.5]" />}
                          {item.status === 'Non-Compliant' && <X className="w-3 h-3 stroke-[2.5]" />}
                          {item.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Score: {item.scoreAwarded}/{item.weight}
                        </div>
                      </td>

                      <td className="py-3.5 px-6 align-top text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {item.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================
              FEEDBACK SECTION (Requirement 7)
              Small, clean, unobtrusive at bottom
             ============================================================ */}
          <div className="premium-card rounded-2xl p-5 border border-slate-200 dark:border-blue-500/20 max-w-xl mx-auto shadow-xs">
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Was this verification helpful?
              </h4>

              {feedbackSubmitted ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Thank you for your feedback! Your evaluation has been saved.</span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="w-full space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackRating('helpful')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        feedbackRating === 'helpful'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackRating('not_helpful')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        feedbackRating === 'not_helpful'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Not Helpful</span>
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Write your feedback..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="input-enterprise block w-full px-3 py-1.5 rounded-xl text-xs"
                      maxLength={300}
                    />
                  </div>

                  {feedbackError && (
                    <p className="text-[11px] text-rose-500 font-medium">{feedbackError}</p>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={feedbackSubmitting || !feedbackRating}
                      className="btn-primary inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl text-white disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>{feedbackSubmitting ? 'Saving...' : 'Submit Feedback'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
