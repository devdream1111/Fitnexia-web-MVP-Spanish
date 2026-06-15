'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

import { Logo } from '@/components/layout/Logo';
import { LEGAL_LABELS } from '@/constants/labels';
import {
  parseLegalDocument,
  slugifyLegalHeading,
  type LegalSection,
} from '@/utils/legal-document';

type LegalVariant = 'terms' | 'privacy';

function sectionId(section: LegalSection) {
  return slugifyLegalHeading(section.heading);
}

function LegalSectionContent({ section }: { section: LegalSection }) {
  return (
    <section id={sectionId(section)} className="fn-legal-section scroll-mt-28">
      <h2 className="fn-legal-section-title">{section.heading}</h2>
      <div className="fn-legal-section-body">
        {section.blocks.map((block, index) => {
          if (block.type === 'list') {
            return (
              <ul key={index} className="fn-legal-list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }

          return (
            <p key={index}>
              {block.text.includes('@') ? (
                <a href={`mailto:${block.text.trim()}`} className="fn-legal-link">
                  {block.text}
                </a>
              ) : (
                block.text
              )}
            </p>
          );
        })}
      </div>
    </section>
  );
}

export function LegalDocumentLayout({
  content,
  variant,
  relatedHref,
  relatedLabel,
}: {
  content: string;
  variant: LegalVariant;
  relatedHref: string;
  relatedLabel: string;
}) {
  const doc = useMemo(() => parseLegalDocument(content), [content]);
  const HeroIcon = variant === 'privacy' ? Shield : FileText;

  return (
    <div className="fn-legal-page">
      <header className="fn-legal-topbar">
        <div className="fn-layout-shell flex h-16 items-center justify-between gap-4">
          <Logo href="/" size="sm" />
          <Link href="/" className="fn-legal-back-link">
            <ArrowLeft size={16} />
            {LEGAL_LABELS.backToHome}
          </Link>
        </div>
      </header>

      <div className="fn-legal-hero">
        <div className="fn-layout-shell fn-legal-hero-inner">
          <span className="fn-legal-hero-badge">
            <HeroIcon size={16} />
            {variant === 'privacy' ? LEGAL_LABELS.privacyLink : LEGAL_LABELS.termsLink}
          </span>
          <h1 className="fn-legal-hero-title">{doc.title}</h1>
          {doc.updated ? <p className="fn-legal-hero-meta">{doc.updated}</p> : null}
        </div>
      </div>

      <div className="fn-layout-shell fn-legal-body">
        <aside className="fn-legal-toc" aria-label={LEGAL_LABELS.tableOfContents}>
          <p className="fn-legal-toc-label">{LEGAL_LABELS.tableOfContents}</p>
          <nav className="fn-legal-toc-nav">
            {doc.sections.map((section) => (
              <a key={section.heading} href={`#${sectionId(section)}`} className="fn-legal-toc-link">
                {section.heading}
              </a>
            ))}
          </nav>
        </aside>

        <article className="fn-legal-article">
          <div className="fn-legal-article-card">
            {doc.sections.map((section) => (
              <LegalSectionContent key={section.heading} section={section} />
            ))}
          </div>

          <footer className="fn-legal-related">
            <p className="fn-legal-related-label">{LEGAL_LABELS.relatedDocuments}</p>
            <Link href={relatedHref} className="fn-legal-related-link">
              {relatedLabel}
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
