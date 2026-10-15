'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  User,
  LogOut,
  ShieldCheck,
  Settings,
  HelpCircle,
  Cpu,
  FileCheck,
  Layers,
  FolderOpen,
  Briefcase,
  Users,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { UserRole } from '@/types';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName = 'BidRakshak User', userEmail = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const [currentRole, setCurrentRole] = useState<UserRole>('officer');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role) {
          setCurrentRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  const handleRoleToggle = async () => {
    const nextRole: UserRole = currentRole === 'officer' ? 'bidder' : 'officer';
    setCurrentRole(nextRole);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      router.refresh();
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  const navItems = [
    {
      name: t('navDashboard', 'Dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Intelligence & Metrics',
    },
    {
      name: t('navTenderLibrary', 'Tender Library'),
      href: '/tenders',
      icon: FolderOpen,
      description: 'Discover & Browse Tenders',
    },
    {
      name: t('navBidderLibrary', 'Bidder Library'),
      href: '/bidders',
      icon: Briefcase,
      description: 'Applications & Bid Profile',
    },
    {
      name: t('navCreateTender', 'Create Tender'),
      href: '/upload',
      icon: UploadCloud,
      description: 'Extract & Publish Baseline',
    },
    {
      name: t('navVerifications', 'Verification Reports'),
      href: '/verifications',
      icon: FileCheck,
      description: 'Audit & Compliance Reports',
    },
    {
      name: t('navProfile', 'Officer & Profile'),
      href: '/profile',
      icon: User,
      description: 'Credentials & Role Settings',
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-200 dark:border-blue-500/15 min-h-screen bg-white dark:bg-[#071224] transition-colors duration-200 relative">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 dark:from-blue-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="relative px-5 py-5 border-b border-slate-200 dark:border-blue-500/15 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-8 w-36">
            <Image
              src="/bidrakshak-logo.png"
              alt="BidRakshak"
              fill
              className="object-contain object-left dark:brightness-110"
            />
          </div>
        </Link>
        <ThemeToggle className="scale-90" />
      </div>

      {/* Language Switcher Bar */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Language / भाषा:</span>
        <LanguageSelector variant="badge" />
      </div>

      {/* Role Switcher Badge */}
      <div className="px-4 pt-2.5">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Active Role</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                {currentRole === 'officer' ? 'Procurement Officer' : 'Bidder / Vendor'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRoleToggle}
            className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
            title="Toggle between Officer and Bidder view"
          >
            Switch
          </button>
        </div>
      </div>

      {/* AI Engine status banner */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
              AI ENGINE
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-blink" />
            Active
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          Workspaces
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 dark:bg-cyan-500/20 text-white dark:text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-white dark:text-cyan-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="relative px-3 py-3 border-t border-slate-200 dark:border-blue-500/15">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-blue-600/10 dark:bg-cyan-500/20 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold text-xs shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{userEmail || 'Authenticated'}</p>
          </div>
          <button
            onClick={handleLogout}
            title={t('navLogout', 'Sign Out')}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
