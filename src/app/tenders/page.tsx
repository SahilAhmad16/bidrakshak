'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { EmptyState } from '@/components/EmptyState';
import { DeleteModal } from '@/components/DeleteModal';
import { TenderRecord, TenderStatus } from '@/types';
import { useLanguage } from '@/lib/i18n';
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
  Tag,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Send,
  Eye,
  Briefcase,
} from 'lucide-react';

export default function TenderLibraryPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [tenders, setTenders] = useState<TenderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'CLOSED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<TenderRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchTenders = async () => {
    try {
      // First try to fetch user's tenders (or published tenders if unauthenticated)
      const res = await fetch('/api/tenders');
      const data = await res.json();
      if (data && data.tenders) {
        setTenders(data.tenders);
      }
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
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.user) setUser(data.user);
      })
      .catch(() => {});

    fetchTenders();
  }, []);

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

  const handlePublishTender = async (tenderId: string) => {
    try {
      const res = await fetch(`/api/tenders/${tenderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' }),
      });
      if (!res.ok) throw new Error('Failed to publish tender.');
      setTenders((prev) =>
        prev.map((t) => (t.id === tenderId ? { ...t, status: 'Published' } : t))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error publishing tender');
    }
  };

  // Derive categories list from existing tenders
  const categories = useMemo(() => {
    const set = new Set<string>();
    tenders.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tenders]);

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.title.toLowerCase().includes(q) ||
        t.organization.toLowerCase().includes(q) ||
        (t.tenderReference && t.tenderReference.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.documentRef.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'PUBLISHED') {
        if (t.status !== 'Published' && t.status !== ('Completed' as any)) return false;
      } else if (statusFilter === 'DRAFT') {
        if (t.status !== 'Draft') return false;
      } else if (statusFilter === 'CLOSED') {
        if (t.status !== 'Closed') return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tenders, searchQuery, statusFilter, categoryFilter]);

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    d.setHours(23, 59, 59, 999);
    return Date.now() > d.getTime();
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
                {t('sihBadge', 'Procurement Intelligence System')}
              </span>
              <span className="text-[10px] text-slate-400">• SIH 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('tenderLibraryTitle', 'Tender Discovery & Library')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('tenderLibrarySubtitle', 'Browse active government tenders, review qualification criteria, and apply directly.')}
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

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-blue-500/20 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchTendersPlaceholder', 'Search by tender title, reference, issuing department...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500 dark:focus:border-cyan-400 text-slate-800 dark:text-slate-200 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('filterAll', 'All Tenders')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PUBLISHED')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'PUBLISHED'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('filterPublished', 'Published / Open')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('DRAFT')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'DRAFT'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('filterDraft', 'Drafts')}
                </button>
              </div>

              {/* Category Dropdown */}
              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="ALL">{t('filterCategory', 'All Categories')}</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : filteredTenders.length === 0 ? (
            <EmptyState
              title={t('noTendersFound', 'No tenders found')}
              description={
                searchQuery
                  ? 'No published tenders or drafts match your search filters.'
                  : 'Get started by creating and publishing your first tender RFP baseline.'
              }
              actionHref="/upload"
              actionText={t('navCreateTender', 'Create Tender')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTenders.map((tender) => {
                const isDraft = tender.status === 'Draft';
                const isClosed = tender.status === 'Closed' || isDeadlinePassed(tender.submissionDeadline);
                const isCreator = user && tender.userId === user.id;

                return (
                  <div
                    key={tender.id}
                    className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold tracking-wider text-blue-700 dark:text-cyan-300 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/25 truncate max-w-[160px]">
                          {tender.tenderReference || 'TND-REF'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isDraft ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {t('statusDraft', 'Draft')}
                            </span>
                          ) : isClosed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-600 dark:text-slate-400">
                              {t('statusClosed', 'Closed')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-blink" />
                              {t('statusOpen', 'Open')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <Link href={`/tenders/${tender.id}`} className="group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {tender.title}
                        </h3>
                      </Link>

                      {/* Organization */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{tender.organization}</span>
                      </div>

                      {/* Category & Location */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {tender.category && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {tender.category}
                          </span>
                        )}
                        {tender.location && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {tender.location}
                          </span>
                        )}
                      </div>

                      {/* Meta Details: Budget & Deadline */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">{t('budgetLabel', 'Estimated Value')}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {tender.estimatedBudget || 'Not Disclosed'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{t('deadlineLabel', 'Deadline')}</span>
                          <span
                            className={`font-semibold ${
                              isClosed
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {tender.submissionDeadline || 'Open'}
                          </span>
                        </div>
                      </div>

                      {/* Requirements and Applications counters */}
                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {tender.requirements?.length || 0} Clauses
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-cyan-400">
                          <UserCheck className="w-3.5 h-3.5" />
                          {tender.applicationsCount !== undefined
                            ? `${tender.applicationsCount} Bids`
                            : tender.biddersCount !== undefined
                            ? `${tender.biddersCount} Audits`
                            : '0 Bids'}
                        </span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <Link
                        href={`/tenders/${tender.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('btnViewDetails', 'View Details')}</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        {isDraft && isCreator && (
                          <button
                            type="button"
                            onClick={() => handlePublishTender(tender.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                            title="Publish tender to Tender Library"
                          >
                            <Send className="w-3 h-3" />
                            <span>{t('btnPublish', 'Publish')}</span>
                          </button>
                        )}

                        {!isDraft && !isClosed && (
                          <Link
                            href={`/tenders/${tender.id}?apply=true`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>{t('btnApply', 'Apply')}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}

                        {isCreator && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(tender)}
                            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg cursor-pointer"
                            title="Delete Tender"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          isOpen={!!deleteTarget}
          tenderTitle={deleteTarget.title}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
