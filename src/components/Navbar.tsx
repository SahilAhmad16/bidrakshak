'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, X, ArrowRight, Bell, Cpu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeProvider';

const NOTIFICATIONS = [
  { id: 1, text: 'AI Engine processed 3 tenders today', time: '2h ago', color: 'bg-cyan-500' },
  { id: 2, text: 'GST compliance check completed', time: '4h ago', color: 'bg-emerald-500' },
  { id: 3, text: 'New MSME policy update detected', time: '1d ago', color: 'bg-amber-500' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#040c18]/95 backdrop-blur-xl border-b border-blue-500/15 shadow-lg shadow-black/30'
            : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs'
          : isDark
          ? 'bg-[#040c18]/80 backdrop-blur-md border-b border-blue-500/10'
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-9 w-40">
              <Image
                src="/bidrakshak-logo.png"
                alt="BidRakshak Logo"
                fill
                className="object-contain object-left dark:brightness-110"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-600 dark:text-slate-400">
            <Link
              href="/"
              className={`hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-200 ${
                pathname === '/' ? 'text-blue-600 dark:text-cyan-400 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-200"
            >
              Verification Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-200"
            >
              How It Works
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-200"
            >
              Dashboard
            </Link>
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI Engine Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                AI Engine
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-blink" />
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {loading ? (
              <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800/60 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 status-blink" />
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#071224] border border-slate-200 dark:border-blue-500/20 rounded-xl shadow-2xl animate-fade-in overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-blue-500/15 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider">AI Notifications</span>
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">{NOTIFICATIONS.length} new</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-blue-500/10">
                        {NOTIFICATIONS.map((n) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-blue-500/5 transition-colors cursor-pointer">
                            <div className="flex items-start gap-2.5">
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.color}`} />
                              <div>
                                <p className="text-xs text-slate-700 dark:text-slate-200">{n.text}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-blue-500/20 rounded-xl transition-all duration-200"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Dashboard
                </Link>

                {/* User */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-blue-500/20">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#071224] px-4 py-4 space-y-3 animate-fade-in shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 py-1.5"
          >
            Home
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 py-1.5"
          >
            Verification Features
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 py-1.5"
          >
            How It Works
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-200 dark:border-blue-500/15 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-blue-600 dark:text-cyan-400 py-1.5"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-sm text-rose-600 dark:text-rose-400 py-1.5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-blue-500/15 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-500/20 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center py-2 text-sm font-semibold rounded-xl text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
