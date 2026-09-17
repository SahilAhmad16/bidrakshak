'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { EmptyState } from '@/components/EmptyState';
import { DashboardMetrics } from '@/types';
import {
  FileText,
  UserCheck,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Plus,
  Building2,
  BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        const metricsRes = await fetch('/api/dashboard');
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData.metrics);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-base)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 animate-spin border-t-blue-500" />
            <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400 absolute inset-0 m-auto" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Loading Intelligence Dashboard</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to GovTech verification engine...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Tenders',
      value: metrics?.totalTenders ?? 0,
      unit: 'tenders',
      icon: FileText,
      iconBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Bidders Audited',
      value: metrics?.totalBiddersVerified ?? metrics?.completedAnalysis ?? 0,
      unit: 'submittals',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 'up',
    },
    {
      label: 'Average Compliance',
      value: (metrics?.averageComplianceScore ?? metrics?.averageScore ?? 0) > 0 ? `${metrics?.averageComplianceScore ?? metrics?.averageScore}` : '—',
      unit: '/ 100',
      icon: Award,
      iconBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: 'up',
    },
    {
      label: 'Procurement Risk Index',
      value: (metrics?.riskDistribution.high ?? 0) > 0 ? `${metrics?.riskDistribution.high} High` : 'Healthy',
      unit: '',
      icon: ShieldCheck,
      iconBg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                Procurement Intelligence
              </span>
              <span className="text-[10px] text-slate-400">• SIH 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Tenders &amp; Bidders Audit Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Welcome back, <span className="text-slate-800 dark:text-slate-200 font-semibold">{user?.name}</span>. Real-time multi-tender verification &amp; risk analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/upload"
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tender</span>
            </Link>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-7">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link
              href="/upload"
              className="group premium-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] border-blue-500/20 hover:border-blue-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30">
                    Step 1
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                  Create Procurement Tender
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Upload tender RFP documents or paste criteria. The AI extracts isolated statutory, financial, and technical requirements specifically for that tender.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-cyan-400">
                <span>Add Tender Document</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/upload?type=verify_bidder"
              className="group premium-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] border-emerald-500/20 hover:border-emerald-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Step 2
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Verify Bidder Against Tender
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Select an existing tender and audit bidder submittals. Clause-by-clause comparative verification computes Compliance Score, Risk Score, and Risk Level.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-500/15 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Run Comparative Audit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Metrics & Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="premium-card p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    {card.trend === 'up' && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</span>
                    {card.unit && <span className="text-xs text-slate-500 dark:text-slate-400">{card.unit}</span>}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Risk Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 premium-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    Bidder Compliance Risk Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Calibrated according to standard procurement guidelines (Rule 4 &amp; 5)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'LOW RISK',
                    sublabel: 'Compliance: 80–100%',
                    value: metrics?.riskDistribution.low ?? 0,
                    dotColor: 'bg-emerald-500',
                    borderColor: 'border-emerald-200 dark:border-emerald-500/20',
                    bg: 'bg-emerald-50 dark:bg-emerald-500/5',
                    textColor: 'text-emerald-700 dark:text-emerald-400',
                  },
                  {
                    label: 'MEDIUM RISK',
                    sublabel: 'Compliance: 65–79%',
                    value: metrics?.riskDistribution.medium ?? 0,
                    dotColor: 'bg-amber-500',
                    borderColor: 'border-amber-200 dark:border-amber-500/20',
                    bg: 'bg-amber-50 dark:bg-amber-500/5',
                    textColor: 'text-amber-700 dark:text-amber-400',
                  },
                  {
                    label: 'HIGH RISK',
                    sublabel: 'Compliance: 0–64%',
                    value: metrics?.riskDistribution.high ?? 0,
                    dotColor: 'bg-rose-500',
                    borderColor: 'border-rose-200 dark:border-rose-500/20',
                    bg: 'bg-rose-50 dark:bg-rose-500/5',
                    textColor: 'text-rose-700 dark:text-rose-400',
                  },
                ].map((tier) => (
                  <div
                    key={tier.label}
                    className={`flex items-center justify-between p-4 rounded-xl border ${tier.bg} ${tier.borderColor}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shadow-[0_0_6px_currentColor] ${tier.dotColor}`} />
                      <div>
                        <p className={`text-xs font-bold ${tier.textColor}`}>{tier.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{tier.sublabel}</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-black ${tier.textColor}`}>{tier.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="premium-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    Procurement Health
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {(metrics?.totalBiddersVerified ?? 0) > 0
                    ? `Verified ${metrics?.totalBiddersVerified} bidders across ${metrics?.totalTenders} tenders. Average compliance rate is ${metrics?.averageComplianceScore}%, with Risk Score mathematically computed as 100 - Compliance.`
                    : 'Create a Tender and upload Bidder documents to generate requirement-wise verification reports, compliance scores, and risk ratings.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  GFR 2017 &amp; CVC Aligned
                </span>
                <Link
                  href="/tenders"
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  View Tenders
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Bidder Verifications Table */}
          <section className="premium-card rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-blue-500/15 flex items-center justify-between bg-slate-50/50 dark:bg-[#071224]/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Recent Bidder Verifications
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Log of completed bidder comparative evaluations against tenders
                </p>
              </div>
              <Link
                href="/tenders"
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                All Tenders
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!metrics?.recentVerifications || metrics.recentVerifications.length === 0 ? (
              <EmptyState
                title="No bidder verifications yet"
                description="Upload a bidder submittal against a tender to see verification scores and reports."
                actionText="Verify a Bidder"
                actionHref="/upload"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-blue-500/10 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#071224]/60">
                      <th className="py-3 px-6">Bidder Organization</th>
                      <th className="py-3 px-6">Target Tender</th>
                      <th className="py-3 px-6">Compliance Score</th>
                      <th className="py-3 px-6">Risk Score</th>
                      <th className="py-3 px-6">Risk Level</th>
                      <th className="py-3 px-6 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10 text-xs">
                    {metrics.recentVerifications.map((v) => (
                      <tr key={v.id} className="table-row-hover">
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                          {v.bidderName}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {v.tenderTitle}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {v.compliancePercentage}%
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {v.riskScore}/100
                        </td>
                        <td className="py-4 px-6">
                          <RiskBadge level={v.riskLevel} size="sm" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/verifications/${v.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-500/20 transition-all"
                          >
                            <span>Open Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
