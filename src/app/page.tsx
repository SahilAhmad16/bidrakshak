'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  ArrowRight, ShieldCheck, UploadCloud, Cpu, BarChart3,
  FileCheck, CheckCircle2, AlertTriangle, Zap, Lock,
  Database, Layers, Sparkles, Check, FileText, Shield
} from 'lucide-react';

const COMPLIANCE_SOURCES = [
  { id: 'gst',       label: 'GST',            sublabel: 'Goods & Services Tax',         angle: 0,   color: '#00ff88' },
  { id: 'msme',      label: 'MSME / Udyam',   sublabel: 'Ministry of MSME',              angle: 40,  color: '#ff00ff' },
  { id: 'pan',       label: 'PAN / IT',        sublabel: 'CBDT Income Tax',              angle: 80,  color: '#0088ff' },
  { id: 'epfo',      label: 'EPFO',            sublabel: 'Provident Fund Org.',           angle: 120, color: '#00ff88' },
  { id: 'esic',      label: 'ESIC',            sublabel: 'Employees State Insurance',     angle: 160, color: '#ff00ff' },
  { id: 'startup',   label: 'Startup India',   sublabel: 'DPIIT Certified',              angle: 200, color: '#0088ff' },
  { id: 'nsic',      label: 'NSIC',            sublabel: 'Nat. Small Industries Corp',   angle: 240, color: '#00ff88' },
  { id: 'oem',       label: 'OEM Auth.',       sublabel: 'Manufacturer Authorization',   angle: 280, color: '#ff00ff' },
  { id: 'mii',       label: 'Make in India',   sublabel: 'Public Procurement Order',     angle: 320, color: '#0088ff' },
];

const VERIFICATION_MODES = [
  {
    type: 'tender', badge: 'Stage 1', title: 'Tender Creation',
    description: 'Create tenders and extract isolated requirement benchmarks across statutory, financial, and technical criteria.',
    icon: FileText, iconColor: 'text-[#00ff88]', iconBg: 'bg-[#00ff88]/10 border-[#00ff88]/30',
    features: ['Isolated tender criteria', 'Turnover & statutory clauses', 'Zero cross-tender mixing'],
    href: '/upload',
  },
  {
    type: 'bid', badge: 'Stage 2', title: 'Bidder Management',
    description: 'Host multiple bidders under each tender. Each bidder is audited independently against that tender\'s specific criteria.',
    icon: Layers, iconColor: 'text-[#ff00ff]', iconBg: 'bg-[#ff00ff]/10 border-[#ff00ff]/30',
    features: ['Multiple bidders per tender', 'Independent audit evaluation', 'Verification history log'],
    href: '/upload',
  },
  {
    type: 'complete', badge: 'Stage 3', title: 'Audit Report',
    description: 'Requirement-by-requirement comparison table, deterministic compliance score, risk score (100 - compliance), and feedback collection.',
    icon: ShieldCheck, iconColor: 'text-[#0088ff]', iconBg: 'bg-[#0088ff]/10 border-[#0088ff]/30',
    features: ['Requirement-wise matrix', 'Risk Score = 100 - Compliance', 'Interactive report feedback'],
    href: '/tenders',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: FileText,      label: 'Create Tender',        desc: 'Define tender and extract isolated requirements.' },
  { step: '02', icon: UploadCloud,   label: 'Upload Bidder',        desc: 'Add multiple bidders under the selected tender.' },
  { step: '03', icon: Layers,        label: 'Clause Comparison',    desc: 'Requirement → Evidence → Status → Remarks.' },
  { step: '04', icon: AlertTriangle, label: 'Score & Risk Rating',  desc: 'Score % & Risk (80-100 Low, 65-79 Med, 0-64 High).' },
  { step: '05', icon: FileCheck,     label: 'Report & Feedback',    desc: 'Full audit report and interactive feedback collection.' },
];

function AIComplianceEngine() {
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [flowActive, setFlowActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setFlowActive((prev) => (prev + 1) % COMPLIANCE_SOURCES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const ORBIT_RADIUS = 160;
  const CENTER = 200;
  const SVG_SIZE = 400;

  if (!mounted) return <div style={{ width: SVG_SIZE, height: SVG_SIZE }} />;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <svg width={SVG_SIZE} height={SVG_SIZE} className="absolute inset-0" style={{ overflow: 'visible' }}>
          {COMPLIANCE_SOURCES.map((src, i) => {
            const rad = (src.angle * Math.PI) / 180;
            const x2 = Number((CENTER + ORBIT_RADIUS * Math.cos(rad)).toFixed(2));
            const y2 = Number((CENTER + ORBIT_RADIUS * Math.sin(rad)).toFixed(2));
            const isActive = flowActive === i;
            return (
              <g key={src.id}>
                <line x1={CENTER} y1={CENTER} x2={x2} y2={y2} stroke={src.color} strokeWidth={isActive ? 2 : 1} strokeOpacity={isActive ? 0.8 : 0.25} strokeDasharray="4 4" />
                {isActive && (
                  <circle r="4" fill={src.color} filter="drop-shadow(0 0 4px currentColor)">
                    <animateMotion path={`M ${x2} ${y2} L ${CENTER} ${CENTER}`} dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r={ORBIT_RADIUS} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="6 6" fill="none" />
        </svg>

        <div className="absolute rounded-full flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(0,255,136,0.3)] z-20 cursor-pointer bg-black border-2 border-[#00ff88]" style={{ width: 100, height: 100, left: CENTER - 50, top: CENTER - 50 }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00ff88] to-[#0088ff] text-black flex items-center justify-center mb-1">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-white">BidRakshak</span>
          <span className="text-[8px] font-bold text-[#00ff88]">AI CORE</span>
        </div>

        {COMPLIANCE_SOURCES.map((src, i) => {
          const rad = (src.angle * Math.PI) / 180;
          const x = Number((CENTER + ORBIT_RADIUS * Math.cos(rad) - 36).toFixed(2));
          const y = Number((CENTER + ORBIT_RADIUS * Math.sin(rad) - 22).toFixed(2));
          const isActive = flowActive === i || activeSource === src.id;
          return (
            <div key={src.id} onMouseEnter={() => setActiveSource(src.id)} onMouseLeave={() => setActiveSource(null)}
              className={`absolute px-2.5 py-1.5 rounded-xl border text-center transition-all duration-300 cursor-pointer z-10 ${isActive ? 'bg-black/90 scale-110' : 'bg-black/50 backdrop-blur-md'}`}
              style={{ left: x, top: y, borderColor: isActive ? src.color : 'rgba(255,255,255,0.1)', boxShadow: isActive ? `0 0 16px ${src.color}40` : undefined }}>
              <span className="block text-[10px] font-bold text-white leading-none">{src.label}</span>
              <span className="block text-[8px] text-white/50 leading-tight mt-0.5 truncate max-w-[65px]">{src.sublabel}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/40 text-center mt-3 max-w-xs leading-relaxed font-sans">Autonomous data cross-referencing between 9 Indian Government regulatory sources and BidRakshak AI</p>
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    // Add custom fonts and global styles for the tubes landing
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      @import url('https://fonts.cdnfonts.com/css/clash-grotesk');
      .font-display { font-family: 'Clash Grotesk', sans-serif; }
      .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
      .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); }
      .btn-glow-cyan { box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
      .btn-glow-cyan:hover { box-shadow: 0 0 35px rgba(0, 255, 136, 0.6); }
    `;
    document.head.appendChild(style);

    // Initialize Tubes Cursor WebGL Script
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import TubesCursor from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
      const canvas = document.getElementById('tubes-canvas');
      const container = document.getElementById('canvas-container');
      if (canvas && container) {
        window.tubesApp = TubesCursor(canvas, {
          tubes: {
            colors: ["#00ff88", "#ff00ff", "#0088ff"],
            lights: {
              intensity: 300,
              colors: ["#00ff88", "#ff00ff", "#ffffff", "#0088ff"]
            }
          }
        });
        const randomColor = () => "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        window.addEventListener('click', (e) => {
          if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
          if(window.tubesApp) {
            window.tubesApp.tubes.setColors([randomColor(), randomColor(), randomColor()]);
            window.tubesApp.tubes.setLightsColors([randomColor(), randomColor(), randomColor(), randomColor()]);
          }
        });
        window.addEventListener('resize', () => {
          if(canvas && container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
          }
        });
      }
    `;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(style);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if ((window as any).tubesApp?.destroy) {
        (window as any).tubesApp.destroy();
      }
    };
  }, []);

  return (
    <div className="font-body bg-[#0a0a0a] min-h-screen relative text-white overflow-x-hidden selection:bg-[#00ff88] selection:text-black">
      {/* 3D Tubes Background Canvas */}
      <div id="canvas-container" className="fixed inset-0 z-0 pointer-events-auto">
        <canvas id="tubes-canvas" className="w-full h-full block" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 pointer-events-none">
        
        {/* We need to re-enable pointer events for interactive elements */}
        <div className="pointer-events-auto">
          <Navbar />
        </div>

        {/* HERO SECTION */}
        <main className="w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center min-h-[85vh] text-center pointer-events-none">
          <div className="flex flex-col items-center gap-8 pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#00ff88] text-xs font-bold tracking-tighter uppercase mb-4 shadow-lg backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              Smart India Hackathon 2026 · AI Government Tech
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-none select-none drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              AI-Powered <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#0088ff] to-[#ff00ff]">
                Tender & Bid Verification
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-white/70 max-w-3xl leading-snug drop-shadow-lg font-sans">
              Automate RFP compliance auditing, verify bidder statutory credentials (GST, PAN, MSME, OEM), and execute dual comparative verification in seconds.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link href="/upload" className="px-8 py-4 bg-[#00ff88] text-black font-extrabold rounded-xl btn-glow-cyan hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                LAUNCH VERIFICATION HUB <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#modes" className="px-8 py-4 glass-card text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                EXPLORE 3 AUDIT MODES
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-4xl w-full">
              {[
                { icon: ShieldCheck, label: 'GFR 2017 & CVC Aligned', color: 'text-[#00ff88]' },
                { icon: Database,    label: 'GST, PAN & MSME Checks', color: 'text-[#0088ff]' },
                { icon: BarChart3,   label: 'Intelligent Risk Scoring', color: 'text-[#ff00ff]' },
                { icon: Lock,        label: 'Zero Data Retention Policy', color: 'text-white' },
              ].map((badge) => (
                <div key={badge.label} className="glass-card flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                  <badge.icon className={`w-6 h-6 shrink-0 ${badge.color}`} />
                  <span className="text-xs font-bold text-white text-left leading-tight tracking-wide uppercase">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* MODES SECTION */}
        <section id="modes" className="py-24 relative pointer-events-auto">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl -z-10" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tighter">
                Three Powerful Verification Capabilities
              </h2>
              <p className="text-white/50 font-medium mt-4 max-w-2xl mx-auto font-sans">
                Purpose-built for procurement authorities, technical committees, and bidders seeking high compliance confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VERIFICATION_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div key={mode.type} className="glass-card p-8 rounded-[32px] flex flex-col justify-between hover:bg-white/5 transition-all group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${mode.iconBg}`}>
                          <Icon className={`w-7 h-7 ${mode.iconColor}`} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white">
                          {mode.badge}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white">{mode.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed mt-3 font-sans">
                        {mode.description}
                      </p>
                      <div className="mt-6 space-y-3 pt-6 border-t border-white/10 font-sans">
                        {mode.features.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-white/80">
                            <Check className="w-4 h-4 text-[#00ff88] shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <Link href={mode.href} className="inline-flex items-center gap-2 text-sm font-bold text-[#00ff88] hover:gap-3 transition-all tracking-widest uppercase">
                        <span>Launch Module</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI ENGINE SECTION */}
        <section id="ai-engine" className="py-24 relative pointer-events-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-xl -z-10" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088ff]/10 border border-[#0088ff]/30 text-[#0088ff] text-xs font-bold tracking-widest uppercase">
                  <Cpu className="w-4 h-4" /> AI Compliance Engine
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
                  9 Govt Frameworks.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0088ff] to-[#00ff88]">
                    One Unified AI Layer.
                  </span>
                </h2>
                <p className="text-lg text-white/60 font-sans leading-relaxed max-w-lg">
                  BidRakshak cross-references tender clauses and bidder qualifications against GSTIN formats, Udyam MSME thresholds, CBDT PAN verification, EPFO labor codes, and PPP-MII local content declarations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 w-full">
                  {[
                    'Instant OCR text extraction from scanned PDFs',
                    'Detection of dummy GST/PAN placeholder numbers',
                    'Turnover & audited balance sheet UDIN audit',
                    'OEM Authorization Form (MAF) verification',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-white/80 font-sans">
                      <CheckCircle2 className="w-5 h-5 text-[#0088ff] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/upload" className="px-8 py-4 bg-[#0088ff] text-white font-extrabold rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(0,136,255,0.4)]">
                  TRY LIVE DEMO NOW <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <div className="glass-card p-8 rounded-[32px] border border-white/20 shadow-2xl">
                  <AIComplianceEngine />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 relative pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tighter">
                Simple 5-Step Process
              </h2>
              <p className="text-white/50 font-medium mt-4 max-w-2xl mx-auto font-sans">
                From raw procurement PDF to detailed compliance audit in under 10 seconds.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {HOW_IT_WORKS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="glass-card p-6 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300">
                    <span className="text-[10px] font-black text-[#ff00ff] bg-[#ff00ff]/10 px-3 py-1 rounded-full border border-[#ff00ff]/30 tracking-widest">
                      STEP {step.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto mt-6 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-display text-lg font-bold text-white">{step.label}</h4>
                    <p className="text-xs text-white/50 mt-2 leading-relaxed font-sans">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-10 bg-black/80 backdrop-blur-xl relative pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center">
                <Shield className="w-4 h-4 text-black" />
              </div>
              <span className="font-display font-bold text-white tracking-widest text-lg">BIDRAKSHAK</span>
            </div>
            <p className="text-xs text-white/40 font-sans">© 2026 BidRakshak • Built for Smart India Hackathon 2026</p>
            <div className="flex items-center gap-6 text-xs font-bold tracking-widest uppercase text-white/60">
              <Link href="/upload" className="hover:text-[#00ff88] transition-colors">Portal</Link>
              <Link href="/dashboard" className="hover:text-[#00ff88] transition-colors">Dashboard</Link>
              <Link href="/tenders" className="hover:text-[#00ff88] transition-colors">Registry</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
