import fs from 'fs';
import path from 'path';

import { LegalDocumentPage } from '@/components/legal/legal-document-page';

export const metadata = {
  title: 'Política de privacidad | Fitnexia',
  description: 'Política de privacidad de Fitnexia.',
};

export default function PrivacyPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'src/content/legal/privacy.txt'),
    'utf-8',
  );

  return (
    <LegalDocumentPage
      content={content}
      variant="privacy"
      relatedHref="/legal/terms"
      relatedLabel="Términos y condiciones"
    />
  );
}
