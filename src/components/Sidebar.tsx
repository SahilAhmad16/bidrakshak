'use client';

import React from 'react';
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
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName = 'BidRakshak User', userEmail = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Metrics',
    },
    {
      name: 'Verification Hub',
      href: '/upload',
      icon: UploadCloud,
      description: 'Tender & Bidder Audit',
    },
    {
      name: 'Tenders Registry',
      href: '/tenders',
      icon: FileSpreadsheet,
      description: 'Tenders & Bidders Log',
    },
    {
      name: 'Officer Profile',
      href: '/profile',
      icon: User,
      description: 'Security & Credentials',
    },
  ];

  const bottomItems = [
    { name: 'Settings', href: '/profile', icon: Settings },
    { name: 'How It Works', href: '/#how-it-works', icon: HelpCircle },
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

      {/* AI Engine status banner */}
      <div className="px-5 pt-4 pb-1">
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
      <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          Verification Workspaces
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 overflow-hidden ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-cyan-300 font-semibold shadow-2xs border border-blue-200 dark:border-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/6 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white dark:bg-blue-500/20 dark:text-cyan-400 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/15 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Label */}
              <div className="flex flex-col min-w-0">
                <span className="leading-tight truncate">{item.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-slate-200 dark:border-blue-500/15" />

        {/* Bottom nav items */}
        <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          Platform Info
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-500/6 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-100 dark:bg-slate-800/40 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Encrypted Security Badge */}
      <div className="relative mx-3 mb-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/15">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span className="text-[10px] font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider">
            Clearance Protocol
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Compliant with GFR 2017 & CVC Guidelines. SIH 2026 Procurement Grade.
        </p>
      </div>

      {/* User Footer */}
      <div className="relative px-4 py-4 border-t border-slate-200 dark:border-blue-500/15 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
