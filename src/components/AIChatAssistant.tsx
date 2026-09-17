'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const PRELOADED_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'user',
    text: 'What is BidRakshak?',
    timestamp: '10:00 AM',
  },
  {
    id: 'm2',
    sender: 'ai',
    text: 'BidRakshak is an AI-powered procurement compliance platform. Users manage multiple Tenders with isolated requirements, and verify multiple Bidders independently against tender specifications to generate requirement-by-requirement verification reports.',
    timestamp: '10:00 AM',
  },
  {
    id: 'm3',
    sender: 'user',
    text: 'How are Compliance and Risk scores calculated?',
    timestamp: '10:01 AM',
  },
  {
    id: 'm4',
    sender: 'ai',
    text: 'Each bidder is audited clause-by-clause against the tender requirements. The Compliance Score (0–100) reflects verified evidence. The Risk Score is mathematically computed as: Risk Score = 100 - Compliance Score. 80–100 is LOW RISK, 65–79 is MEDIUM RISK, and 0–64 is HIGH RISK.',
    timestamp: '10:01 AM',
  },
  {
    id: 'm5',
    sender: 'user',
    text: 'Can a tender have multiple bidders?',
    timestamp: '10:02 AM',
  },
  {
    id: 'm6',
    sender: 'ai',
    text: 'Yes! Each tender can host multiple bidders (e.g. Tender A has Bidder 1, Bidder 2, Bidder 3). Each bidder is evaluated independently against the selected tender’s requirements, and all verification reports are preserved in the tender verification history.',
    timestamp: '10:02 AM',
  },
  {
    id: 'm7',
    sender: 'user',
    text: 'What does the AI Verification Report show?',
    timestamp: '10:03 AM',
  },
  {
    id: 'm8',
    sender: 'ai',
    text: 'The report shows Tender and Bidder details, Compliance Score & %, Risk Score, Risk Level, breakdown counts, Key Risk Factors, AI Verification Summary, a requirement-by-requirement comparison table (Tender Requirement → Bidder Evidence → Verification Status → Remarks), and a feedback section.',
    timestamp: '10:03 AM',
  },
];

const SUGGESTED_QUESTIONS = [
  'What is BidRakshak?',
  'How is the compliance score calculated?',
  'What does High Risk mean?',
  'What documents are checked?',
  'What is the difference between Tender and Bid verification?',
  'How does Complete Verification work?',
];

export function AIChatAssistant() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(PRELOADED_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('what is bidrakshak') || q.includes('about bidrakshak')) {
      return 'BidRakshak is an AI-powered procurement compliance platform. It allows officers to manage multiple Tenders with isolated requirements, host multiple Bidders under each tender, and run clause-by-clause comparative verification to generate deterministic Compliance and Risk scores.';
    }

    if (q.includes('how is the compliance score') || q.includes('how is the risk score') || q.includes('calculate') || q.includes('scoring formula')) {
      return 'Compliance Score (0–100) is determined by evaluating the bidder\'s documents against each isolated tender requirement (Compliant = full weight, Needs Review = half weight, Missing/Non-compliant = 0). The Risk Score is mathematically computed as: Risk Score = 100 - Compliance Score. There are no hardcoded or random scores.';
    }

    if (q.includes('risk level') || q.includes('threshold') || q.includes('below 65') || q.includes('high risk')) {
      return 'Risk Levels are strictly calibrated: 80–100 is LOW RISK (strong compliance), 65–79 is MEDIUM RISK (procedural clarifications needed), and 0–64 is HIGH RISK (critical mandatory requirements failed or omitted).';
    }

    if (q.includes('multiple bidders') || q.includes('tender a') || q.includes('bidder 1') || q.includes('hierarchy')) {
      return 'BidRakshak strictly enforces the hierarchy: TENDER → TENDER REQUIREMENTS → MULTIPLE BIDDERS → BIDDER DOCUMENTS → TENDER vs BIDDER COMPARISON → COMPLIANCE SCORE & % → RISK SCORE & LEVEL → AI VERIFICATION REPORT → FEEDBACK. Requirements and bidders are never mixed between different tenders.';
    }

    if (q.includes('feedback') || q.includes('helpful')) {
      return 'Every AI Verification Report includes an unobtrusive Feedback section at the bottom. Users can vote 👍 Helpful or 👎 Not Helpful, write optional remarks, and submit feedback which is saved directly with that specific verification report.';
    }

    if (q.includes('document') || q.includes('what documents') || q.includes('checked') || q.includes('checklist')) {
      return 'BidRakshak cross-checks critical submittals against tender requirements: 1) GST Registration & GSTR-3B filings, 2) PAN & Tax returns, 3) MSME/Udyam certificates, 4) Company Incorporation, 5) EPFO & ESIC labor compliance, 6) Make in India / Local Content affidavit, 7) OEM Authorization Form (MAF), 8) ISO/BIS Quality Certificates, 9) CA-audited balance sheets with UDIN, and 10) Non-Blacklisting undertakings.';
    }

    if (q.includes('gfr') || q.includes('cvc') || q.includes('gem')) {
      return 'BidRakshak aligns with General Financial Rules (GFR 2017), Central Vigilance Commission (CVC) guidelines, and Government e-Marketplace (GeM) public procurement directives to uphold transparency and integrity.';
    }

    return `Thank you for your question regarding "${query}". BidRakshak AI verifies tender requirements, bidder statutory submittals, and clause-by-clause comparative alignment. You can create a tender or verify any bidder PDF to view the complete verification report.`;
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateAIResponse(text);
      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages(PRELOADED_MESSAGES);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 animate-pulse text-cyan-200" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-600 animate-ping" />
            </div>
            <span className="font-semibold text-xs tracking-wide">AI Assistant</span>
            <span className="hidden sm:inline-block text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
              Online
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[590px] max-h-[85vh] rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.35)] border flex flex-col overflow-hidden transition-all duration-300 animate-fade-up ${
            isDark
              ? 'bg-[#0a1628]/95 border-blue-500/25 backdrop-blur-xl text-slate-100'
              : 'bg-white/95 border-slate-200 backdrop-blur-xl text-slate-800 shadow-2xl'
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 ${
              isDark
                ? 'bg-[#071224] border-blue-500/20'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#071224]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">BidRakshak AI</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
                    Copilot
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  SIH 2026 GovTech Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggested Question Chips */}
          <div
            className={`px-3 py-2 border-b overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0 text-xs ${
              isDark ? 'bg-[#060e1c] border-blue-500/15' : 'bg-slate-100/70 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Suggestions:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-500/30 text-cyan-300 hover:text-white'
                    : 'bg-white hover:bg-blue-50 border-slate-200 text-slate-700 hover:text-blue-700 shadow-2xs'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-xs'
                      : isDark
                      ? 'bg-[#0f1e35] text-slate-200 border border-blue-500/20 rounded-bl-xs shadow-sm'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl rounded-bl-xs flex items-center gap-1.5 ${
                    isDark ? 'bg-[#0f1e35] border border-blue-500/20' : 'bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            className={`p-3 border-t flex items-center gap-2 ${
              isDark ? 'bg-[#071224] border-blue-500/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about score, GST, OEM, Complete Verification..."
              className={`flex-1 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? 'bg-[#040c18] border border-blue-500/30 text-white placeholder-slate-500'
                  : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs hover:opacity-95 disabled:opacity-40 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
