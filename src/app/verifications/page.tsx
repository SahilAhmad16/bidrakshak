'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { EmptyState } from '@/components/EmptyState';
import { VerificationReport } from '@/types';
import { useLanguage } from '@/lib/i18n';
import {
  FileCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
} from 'lucide-react';

export default function VerificationsListPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

    fetch('/api/verifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.verifications) {
          setVerifications(data.verifications);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = verifications.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.tenderTitle && v.tenderTitle.toLowerCase().includes(q)) ||
      (v.bidderName && v.bidderName.toLowerCase().includes(q)) ||
      (v.id && v.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                Audit Reports
              </span>
              <span className="text-[10px] text-slate-400">• SIH 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('navVerifications', 'Verification Reports')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse historical and completed AI-powered compliance audit reports.
            </p>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Search bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-blue-500/20 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit reports by tender title, bidder name, or report ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No verification reports found"
              description="Verification reports are generated when an authorized officer triggers verification on submitted bidder applications."
              actionHref="/tenders"
              actionText="Go to Tender Library"
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-cyan-300 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/25">
                        ID: {item.id}
                      </span>
                      <RiskBadge level={item.riskLevel} />
                    </div>

                    <Link
                      href={`/verifications/${item.id}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 line-clamp-1 block"
                    >
                      {item.tenderTitle || 'Procurement Tender'}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Bidder: {item.bidderName}
                      </span>
                      {item.submittedAt && (
                        <span>
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {item.complianceScore ?? item.compliancePercentage ?? 0}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Compliance</span>
                    </div>

                    <Link
                      href={`/verifications/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
