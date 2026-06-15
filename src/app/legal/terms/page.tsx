import fs from 'fs';
import path from 'path';

import { LegalDocumentPage } from '@/components/legal/legal-document-page';

export const metadata = {
  title: 'Términos y condiciones | Fitnexia',
  description: 'Términos y condiciones de uso de la plataforma Fitnexia.',
};

export default function TermsPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'src/content/legal/terms.txt'),
    'utf-8',
  );

  return (
    <LegalDocumentPage
      content={content}
      variant="terms"
      relatedHref="/legal/privacy"
      relatedLabel="Política de privacidad"
    />
  );
}
