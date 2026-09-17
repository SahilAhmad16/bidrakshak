import React from 'react';
import Link from 'next/link';
import { FileSearch, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title = 'No tenders uploaded yet',
  description = 'Upload a tender document to begin AI compliance analysis and risk verification.',
  actionText = 'Upload Tender',
  actionHref = '/upload',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <FileSearch className="w-8 h-8 text-blue-400" />
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl -z-10" />
      </div>

      <h3 className="text-base font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
        {description}
      </p>

      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white btn-primary rounded-xl"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
}
