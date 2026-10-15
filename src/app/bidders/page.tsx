'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RiskBadge } from '@/components/RiskBadge';
import { EmptyState } from '@/components/EmptyState';
import { TenderApplication, UserProfile } from '@/types';
import { useLanguage } from '@/lib/i18n';
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  Eye,
  AlertTriangle,
  RefreshCw,
  Edit,
  Save,
} from 'lucide-react';

export default function BidderLibraryPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'applications' | 'profile'>('applications');
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<TenderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Profile Form State
  const [companyName, setCompanyName] = useState('');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch profile details
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.user) {
          setProfile(pData.user);
          setCompanyName(pData.user.companyName || pData.user.name || '');
          setPan(pData.user.pan || '');
          setGstin(pData.user.gstin || '');
          setUdyamNumber(pData.user.udyamNumber || '');
          setContactNumber(pData.user.contactNumber || '');
          setAddress(pData.user.address || '');
        }
      }

      // Fetch bidder applications
      const appsRes = await fetch('/api/applications');
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        if (appsData.applications) {
          setApplications(appsData.applications);
        }
      }
    } catch (err) {
      console.error('Error loading bidder dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          pan: pan.trim().toUpperCase(),
          gstin: gstin.trim().toUpperCase(),
          udyamNumber: udyamNumber.trim().toUpperCase(),
          contactNumber: contactNumber.trim(),
          address: address.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update company credentials.');
      const data = await res.json();
      setProfile(data.user);
      setProfileSuccess('Company profile and credentials saved successfully.');
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setSavingProfile(false);
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
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30">
                Bidder Workspace
              </span>
              <span className="text-[10px] text-slate-400">• SIH 2026</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t('bidderLibraryTitle', 'Bidder Dashboard & Library')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('bidderLibrarySubtitle', 'Track your submitted tenders, manage company documentation, and review verification audit outcomes.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>{t('filterAll', 'Browse Tenders')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('totalApplicationsMetric', 'Total Applications')}</span>
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{applications.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('pendingVerificationMetric', 'Awaiting Verification')}</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {applications.filter((a) => a.status === 'Submitted' || a.status === 'Verification Pending').length}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('approvedBidsMetric', 'Verified & Audited')}</span>
                <FileCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {applications.filter((a) => a.status === 'Verified').length}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Re-verification Required</span>
                <AlertTriangle className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {applications.filter((a) => a.isOutdated).length}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'applications'
                  ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('myApplicationsTab', 'My Tender Applications')} ({applications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('companyProfileTab', 'Company Profile & Credentials')}
            </button>
          </div>

          {/* Tab 1: Applications List */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900/40 animate-pulse" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <EmptyState
                  title="No tender applications yet"
                  description="Browse the Tender Library, select an open procurement RFP, and submit your qualification bid."
                  actionHref="/tenders"
                  actionText="Discover Tenders in Library"
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications.map((app) => {
                    const isDraft = app.status === 'Application Draft';
                    const isVerified = app.status === 'Verified';
                    const isRejected = app.status === 'Rejected';
                    const hasReport = !!app.verificationReport || !!app.latestVerificationId;

                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-400 dark:hover:border-cyan-500/40"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/25">
                              {app.tenderReference || 'TND-REF'}
                            </span>

                            {/* Status Badge */}
                            {isDraft ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                                <Clock className="w-3 h-3" />
                                {t('statusAppDraft', 'Draft Application')}
                              </span>
                            ) : isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('statusVerified', 'Verified')}
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                {t('statusRejected', 'Rejected')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-cyan-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 status-blink" />
                                {t('statusSubmitted', 'Submitted')}
                              </span>
                            )}

                            {app.isOutdated && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                                <RefreshCw className="w-2.5 h-2.5" />
                                {t('statusOutdated', 'Re-verification Required')}
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/tenders/${app.tenderId}`}
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 line-clamp-1 block"
                          >
                            {app.tenderTitle}
                          </Link>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {app.bidderName}
                            </span>
                            {app.submittedAt && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              {app.documents?.length || 0} Attached Document(s)
                            </span>
                          </div>

                          {/* Officer Decision Display if present */}
                          {app.officerDecision && app.officerDecision.status !== 'Pending' && (
                            <div className="p-2.5 mt-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  Officer Decision: {app.officerDecision.status}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  by {app.officerDecision.officerName}
                                </span>
                              </div>
                              {app.officerDecision.remarks && (
                                <p className="text-[11px] text-slate-500 mt-1 italic">
                                  &ldquo;{app.officerDecision.remarks}&rdquo;
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {hasReport && (
                            <Link
                              href={`/verifications/${app.latestVerificationId || app.verificationReport?.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>View Audit Report</span>
                            </Link>
                          )}

                          <Link
                            href={`/tenders/${app.tenderId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tender RFP</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Reusable Company Profile */}
          {activeTab === 'profile' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/15 shadow-xs max-w-3xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bidder Company Profile & Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Save your standard corporate registrations (PAN, GSTIN, Udyam) to pre-fill tender applications and speed up procurement verification.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="e.g. ABC Technologies Pvt Ltd"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Permanent Account Number (PAN)
                    </label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      placeholder="e.g. AAACA9999P"
                      maxLength={10}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GSTIN (Goods & Services Tax Number)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      maxLength={15}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      MSME / Udyam Registration Number
                    </label>
                    <input
                      type="text"
                      value={udyamNumber}
                      onChange={(e) => setUdyamNumber(e.target.value)}
                      placeholder="e.g. UDYAM-MH-02-0012345"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Corporate Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter registered office address..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
