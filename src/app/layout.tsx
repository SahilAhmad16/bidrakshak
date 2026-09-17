import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AIChatAssistant } from '@/components/AIChatAssistant';

export const metadata: Metadata = {
  title: 'BidRakshak | AI Government Technology Platform — Smart India Hackathon 2026',
  description:
    'BidRakshak is an AI-powered Government Procurement Intelligence Platform for Smart India Hackathon 2026. Automated tender compliance verification, risk analysis, and smart bid intelligence.',
  icons: {
    icon: '/bidrakshak-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] antialiased transition-colors duration-200 selection:bg-blue-600/30 selection:text-blue-600 dark:selection:text-cyan-300">
        <ThemeProvider>
          {children}
          <AIChatAssistant />
        </ThemeProvider>
      </body>
    </html>
  );
}
