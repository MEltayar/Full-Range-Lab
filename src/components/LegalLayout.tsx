import type { ReactNode } from 'react';

interface Props {
  title: string;
  lastUpdated: string;
  header: ReactNode;
  children: ReactNode;
}

export default function LegalLayout({ title, lastUpdated, header, children }: Props) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#070A12' }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-16">
        <div className="mb-8">{header}</div>
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{title}</h1>
          <p className="text-sm text-white/45 mt-2">Last updated: {lastUpdated}</p>
        </header>
        <article className="legal-prose text-white/75 leading-relaxed text-[15px] space-y-5">
          {children}
        </article>
      </div>
      <style>{`
        .legal-prose h2 {
          color: #fff;
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.01em;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .legal-prose p { margin: 0; }
        .legal-prose ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .legal-prose li::marker { color: rgba(249,115,22,0.7); }
        .legal-prose a {
          color: #fdba74;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-prose a:hover { color: #fed7aa; }
        .legal-prose strong { color: #fff; font-weight: 700; }
      `}</style>
    </div>
  );
}
