import { LegalDocumentLayout } from './legal-document-layout';

export function LegalDocumentPage({
  content,
  variant,
  relatedHref,
  relatedLabel,
}: {
  content: string;
  variant: 'terms' | 'privacy';
  relatedHref: string;
  relatedLabel: string;
}) {
  return (
    <LegalDocumentLayout
      content={content}
      variant={variant}
      relatedHref={relatedHref}
      relatedLabel={relatedLabel}
    />
  );
}
