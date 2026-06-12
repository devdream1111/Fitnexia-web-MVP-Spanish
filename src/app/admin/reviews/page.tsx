'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { StarRating } from '@/components/admin/star-rating';
import { TAB_LABELS, ADMIN_LABELS } from '@/constants/labels';
import { useAdmin } from '@/contexts/admin-context';
import { MOCK_REVIEWS } from '@/data/mock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

type Tab = 'all' | 'reported';

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>('reported');
  const { reportedReviews, dismissReportedReview, removeReportedReview } = useAdmin();
  const [allReviews, setAllReviews] = useState(MOCK_REVIEWS);

  const handleRemoveReported = (id: string) => {
    const reviewId = removeReportedReview(id);
    if (reviewId) setAllReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const removeReview = (id: string) => {
    setAllReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={ADMIN_LABELS.reviews.moderationTitle} showBack />

      <div className="flex gap-2">
        <Button
          variant={tab === 'reported' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setTab('reported')}
        >
          {ADMIN_LABELS.reviews.reported}
          {reportedReviews.length > 0 && (
            <Badge label={String(reportedReviews.length)} variant="danger" size="sm" />
          )}
        </Button>
        <Button
          variant={tab === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setTab('all')}
        >
          {TAB_LABELS.admin.reviews} ({allReviews.length})
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl bg-[var(--fn-surface)]">
        {tab === 'reported' ? (
          reportedReviews.length === 0 ? (
            <p className="p-8 text-center text-[var(--fn-text-muted)]">No hay reseñas reportadas</p>
          ) : (
            reportedReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-[var(--fn-border)] p-4 last:border-b-0 hover:bg-[var(--fn-surface-muted)]"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--fn-text)]">{review.authorName}</span>
                    <StarRating rating={review.rating} />
                    <Badge label={`${review.reportCount} reportes`} variant="danger" />
                  </div>
                  <span className="text-xs text-[var(--fn-text-muted)]">
                    {new Date(review.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <p className="mb-1 text-xs text-[var(--fn-text-muted)]">
                  Motivos: {review.reportReasons.join(', ')}
                </p>
                <p className="mb-3 text-sm text-[var(--fn-text-muted)]">{review.comment}</p>
                <div className="flex gap-2">
                  <Button
                    title={ADMIN_LABELS.reviews.approve}
                    variant="outline"
                    size="sm"
                    onClick={() => dismissReportedReview(review.id)}
                  >
                    <CheckCircle2 size={14} />
                    Mantener
                  </Button>
                  <Button
                    title={ADMIN_LABELS.reviews.remove}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReported(review.id)}
                  >
                    <XCircle size={14} />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )
        ) : allReviews.length === 0 ? (
          <p className="p-8 text-center text-[var(--fn-text-muted)]">No hay reseñas publicadas</p>
        ) : (
          allReviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-[var(--fn-border)] p-4 last:border-b-0 hover:bg-[var(--fn-surface-muted)]"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--fn-text)]">{review.authorName}</span>
                  <StarRating rating={review.rating} />
                  {review.verified && <Badge label="Verificada" variant="success" />}
                </div>
                <span className="text-xs text-[var(--fn-text-muted)]">
                  {new Date(review.createdAt).toLocaleDateString('es-AR')}
                </span>
              </div>
              <p className="text-sm text-[var(--fn-text-muted)]">{review.comment}</p>
              <div className="mt-3">
                <Button
                  title={ADMIN_LABELS.reviews.remove}
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReview(review.id)}
                >
                  <XCircle size={14} />
                  Eliminar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
