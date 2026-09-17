'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import {
  Mail,
  ShieldCheck,
  Award,
  FileText,
  LogOut,
  Lock,
  Database,
  Cpu,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; createdAt?: string } | null>(null);
  const [metrics, setMetrics] = useState<{ totalTenders: number; averageScore: number } | null>(null);
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
          setMetrics({
            totalTenders: metricsData.metrics.totalTenders,
            averageScore: metricsData.metrics.averageScore,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#040c18] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading procurement profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#040c18] text-slate-100">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-[#071224]/80 backdrop-blur-md border-b border-blue-500/15 px-8 py-5 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30">
                Officer Account
              </span>
              <span className="text-[10px] text-slate-500">• SIH 2026</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Procurement Officer Profile</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review credential status, verification metrics, and system security parameters
            </p>
          </div>
        </header>

        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Profile Overview Card */}
          <div className="premium-card p-6 bg-[#0a1628] border border-blue-500/20 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white flex items-center justify-center text-3xl font-extrabold shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.35)] border border-cyan-400/30">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-tight">{user?.name}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active Officer
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-cyan-400/80" />
                    {user?.email}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Clearance: Tier-1 AI Reviewer (GFR 2017 & CVC Cleared)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl transition-all shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Session
              </button>
            </div>
          </div>

          {/* Account Details & Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="premium-card p-6 bg-[#0a1628] rounded-2xl border border-blue-500/15 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Tenders Analyzed
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  LIFETIME
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {metrics?.totalTenders ?? 0}
                </p>
                <p className="text-xs text-slate-400">documents audited by BidRakshak AI</p>
              </div>
            </div>

            <div className="premium-card p-6 bg-[#0a1628] rounded-2xl border border-blue-500/15 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Average Compliance Score
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  GFR BENCHMARK
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  {metrics?.averageScore ? `${metrics.averageScore}/100` : '—'}
                </p>
                <p className="text-xs text-slate-400">average procurement health index</p>
              </div>
            </div>
          </div>

          {/* System Security & AI Architecture Standards */}
          <div className="bg-[#0a1628] rounded-2xl border border-blue-500/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-500/15 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Security & GovTech Protocol Standards
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified security mechanisms enforcing high-integrity public procurement
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-950/70 text-cyan-300 border border-blue-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                GovTech Security Grade
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#071224] rounded-xl border border-blue-500/15 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Lock className="w-4 h-4" />
                  <p className="text-xs font-bold text-white">Session Security</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  HTTP-Only JWT cookies with AES-256 GCM token encryption and strict CSRF protection.
                </p>
              </div>

              <div className="p-4 bg-[#071224] rounded-xl border border-blue-500/15 space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Database className="w-4 h-4" />
                  <p className="text-xs font-bold text-white">Data Isolation</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Per-officer document partitioning with immutable audit records and SHA-256 fingerprinting.
                </p>
              </div>

              <div className="p-4 bg-[#071224] rounded-xl border border-blue-500/15 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Cpu className="w-4 h-4" />
                  <p className="text-xs font-bold text-white">AI Rule Verification</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Continuous rule cross-referencing with GFR 2017, CVC guidelines, and GeM procurement standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
