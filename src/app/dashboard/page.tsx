'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { EmptyState } from '@/components/EmptyState';
import { DashboardMetrics } from '@/types';
import { useLanguage } from '@/lib/i18n';
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
  Briefcase,
  FolderOpen,
  FileCheck,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
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
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Loading Procurement Intelligence Dashboard
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to BidRakshak database...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('metricTenders', 'Published Tenders'),
      value: metrics?.publishedTenders ?? metrics?.totalTenders ?? 0,
      unit: 'tenders',
      icon: FolderOpen,
      iconBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: t('metricBidders', 'Bidder Applications'),
      value: metrics?.totalApplications ?? metrics?.totalBiddersVerified ?? 0,
      unit: 'bids',
      icon: Briefcase,
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 'up',
    },
    {
      label: t('metricVerified', 'Completed Audits'),
      value: metrics?.totalBiddersVerified ?? 0,
      unit: 'audits',
      icon: UserCheck,
      iconBg: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      trend: 'up',
    },
    {
      label: t('metricAverageScore', 'Average Compliance Score'),
      value: (metrics?.averageComplianceScore ?? 0) > 0 ? `${metrics?.averageComplianceScore}` : '—',
      unit: '/ 100',
      icon: Award,
      iconBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: 'up',
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
                {t('sihBadge', 'Procurement Intelligence System')}
              </span>
              <span className="text-[10px] text-slate-400">• SIH 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('dashboardTitle', 'Executive Procurement Intelligence')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('dashboardSubtitle', 'Real-time monitoring of tender publishing, bidder submittals, and AI compliance audits.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('navCreateTender', 'Create Tender')}</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {card.value}
                    </span>
                    {card.unit && <span className="text-xs text-slate-400 font-medium">{card.unit}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/tenders"
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-500/20 hover:border-blue-400 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                {t('navTenderLibrary', 'Tender Library')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Discover published tenders, inspect requirements, and track active procurement deadlines.
              </p>
            </Link>

            <Link
              href="/bidders"
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-500/20 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                {t('navBidderLibrary', 'Bidder Library & Dashboard')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage reusable company credentials, draft submissions, and view application audit statuses.
              </p>
            </Link>

            <Link
              href="/verifications"
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/40 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200/80 dark:border-purple-500/20 hover:border-purple-400 transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                {t('navVerifications', 'Verification Reports')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Clause-by-clause comparative audits with page-level evidence and officer approval records.
              </p>
            </Link>
          </div>

          {/* Risk Distribution and Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Distribution Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('riskDistributionTitle', 'Procurement Risk Distribution')}
                </h3>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Low Risk (80–100%)
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {metrics?.riskDistribution.low ?? 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (metrics?.totalBiddersVerified ?? 0) > 0
                            ? Math.round(((metrics?.riskDistribution.low ?? 0) / (metrics?.totalBiddersVerified ?? 1)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Medium Risk (60–79%)
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {metrics?.riskDistribution.medium ?? 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (metrics?.totalBiddersVerified ?? 0) > 0
                            ? Math.round(((metrics?.riskDistribution.medium ?? 0) / (metrics?.totalBiddersVerified ?? 1)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      High Risk (&lt;60%)
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {metrics?.riskDistribution.high ?? 0}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (metrics?.totalBiddersVerified ?? 0) > 0
                            ? Math.round(((metrics?.riskDistribution.high ?? 0) / (metrics?.totalBiddersVerified ?? 1)) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Completed Verifications */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('recentActivityTitle', 'Recent Applications & Verifications')}
                </h3>
                <Link
                  href="/verifications"
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {!metrics?.recentVerifications || metrics.recentVerifications.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No verifications completed yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    When bidders submit applications and verification is triggered, audit outcomes will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {metrics.recentVerifications.slice(0, 5).map((v) => (
                    <div
                      key={v.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <Link
                          href={`/verifications/${v.id}`}
                          className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 truncate block"
                        >
                          {v.bidderName}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">{v.tenderTitle}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {v.complianceScore}%
                        </span>
                        <RiskBadge level={v.riskLevel} />
                        <Link
                          href={`/verifications/${v.id}`}
                          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
