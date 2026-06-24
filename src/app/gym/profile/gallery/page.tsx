'use client';

import { PageHeader } from '@/components/layout/page-header';
import { PROFILE_MENU_LABELS } from '@/constants/labels';

export default function GalleryPage() {
  return (
    <div>
      <PageHeader title={PROFILE_MENU_LABELS.photoGallery} showBack />
      <p className="text-[var(--fn-text-muted)]">
        La galería se gestiona desde el perfil del gimnasio.
      </p>
    </div>
  );
}
