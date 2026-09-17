'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { EmptyState } from '@/components/EmptyState';
import { DeleteModal } from '@/components/DeleteModal';
import { TenderRecord } from '@/types';
import {
  UploadCloud,
  Search,
  Trash2,
  ChevronRight,
  FileText,
  AlertCircle,
  Building2,
  Layers,
  UserCheck,
  Plus,
  Calendar,
} from 'lucide-react';

export default function MyTendersPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [tenders, setTenders] = useState<TenderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TenderRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchTenders = async () => {
    try {
      const res = await fetch('/api/tenders');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data && data.tenders) setTenders(data.tenders);
    } catch (err) {
      console.error('Failed to load tenders:', err);
      setError('Unable to load tender records.');
    } finally {
      setLoading(false);
    }
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
    fetchTenders();
  }, [router]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tenders/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tender.');
      setTenders((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting tender';
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.organization.toLowerCase().includes(q) ||
        (t.tenderReference && t.tenderReference.toLowerCase().includes(q)) ||
        t.documentRef.toLowerCase().includes(q)
      );
    });
  }, [tenders, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar userName={user?.name} userEmail={user?.email} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-[#071224]/80 backdrop-blur-md border-b border-slate-200 dark:border-blue-500/15 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/30">
                Tenders Hub
              </span>
              <span className="text-[10px] text-slate-400">• Multi-Tender Procurement</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Tenders &amp; Bidders Registry
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage procurement tenders, their isolated requirements, and verify multiple independent bidders
            </p>
          </div>
          <Link
            href="/upload"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Tender</span>
          </Link>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/25 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span className="text-sm text-rose-700 dark:text-rose-300">{error}</span>
            </div>
          )}

          {/* Search Bar */}
          {tenders.length > 0 && (
            <div className="premium-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by tender title, department, reference ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-enterprise block w-full pl-10 pr-4 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Showing <strong className="text-slate-900 dark:text-white">{filteredTenders.length}</strong> of {tenders.length} tenders</span>
              </div>
            </div>
          )}

          {/* Tenders Table */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading tenders registry...</div>
          ) : filteredTenders.length === 0 ? (
            <EmptyState
              title={searchQuery ? 'No tenders match your search' : 'No procurement tenders registered'}
              description={
                searchQuery
                  ? 'Try adjusting your search keywords.'
                  : 'Create your first procurement tender to extract its requirements and start verifying bidders.'
              }
              actionText="Create New Tender"
              actionHref="/upload"
            />
          ) : (
            <div className="premium-card rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-blue-500/15 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-[#071224]/60">
                      <th className="py-3 px-6">Tender Details</th>
                      <th className="py-3 px-6">Issuing Department</th>
                      <th className="py-3 px-6">Requirements</th>
                      <th className="py-3 px-6">Verified Bidders</th>
                      <th className="py-3 px-6">Created Date</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10 text-xs">
                    {filteredTenders.map((t) => (
                      <tr key={t.id} className="table-row-hover">
                        {/* Title & Ref */}
                        <td className="py-4 px-6">
                          <Link
                            href={`/tenders/${t.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-300 transition-colors block max-w-sm truncate"
                          >
                            {t.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                            <span>Ref: {t.tenderReference || t.documentRef}</span>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            {t.organization}
                          </span>
                        </td>

                        {/* Requirements Count */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30">
                            <Layers className="w-3 h-3" />
                            {t.requirements?.length ?? 0} Criteria
                          </span>
                        </td>

                        {/* Bidders Count */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                            <UserCheck className="w-3 h-3" />
                            {t.biddersCount ?? (t.bidders?.length || 0)} Bidders
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-6 text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/tenders/${t.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-500/20 transition-all"
                            >
                              <span>View &amp; Bidders</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => setDeleteTarget(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Tender"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={!!deleteTarget}
          tenderTitle={deleteTarget?.title || ''}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />
      </main>
    </div>
  );
}
6

