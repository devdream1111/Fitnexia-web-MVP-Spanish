'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Star,
  Building,
  UserPlus,
  Clock,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

import { useClasses } from '@/contexts/classes-context';
import { useAdmin } from '@/contexts/admin-context';
import { useReviews } from '@/contexts/reviews-context';
import { MOCK_BOOKINGS, MOCK_PAYMENTS, formatMoney } from '@/data/mock';
import { ADMIN_LABELS, ROLE_TITLES, TAB_LABELS } from '@/constants/labels';
import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/admin/star-rating';

const totalUsers = 150;
const newUsersThisWeek = 12;

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl bg-[var(--fn-surface)] p-6 transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fn-primary-muted)]">
          <Icon size={24} className="text-[var(--fn-primary)]" />
        </div>
        <div>
          <p className="text-sm text-[var(--fn-text-muted)]">{label}</p>
          <p className="text-3xl font-extrabold text-[var(--fn-text)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  time,
  icon: Icon,
}: {
  user: string;
  action: string;
  time: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-4 transition hover:bg-[var(--fn-surface-muted)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fn-primary-muted)]">
        <Icon size={18} className="text-[var(--fn-primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--fn-text)]">
          <span className="font-semibold">{user}</span> {action}
        </p>
        <p className="mt-1 text-xs text-[var(--fn-text-muted)]">{time}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { classes } = useClasses();
  const { removeReview } = useReviews();
  const {
    users,
    institutions,
    pendingVerifications,
    reportedReviews,
    verifyPending,
    rejectPending,
    dismissReportedReview,
    removeReportedReview,
  } = useAdmin();

  const totalInstructors = users.filter((u) => u.role === 'instructor').length;
  const totalInstitutions = institutions.length;
  const totalClasses = classes.length;
  const upcomingClasses = classes.filter((c) => new Date(c.startAt) > new Date()).length;
  const totalBookings = MOCK_BOOKINGS.length;
  const totalRevenueCents = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount.amount, 0);

  const handleRemoveReview = (id: string) => {
    const reviewId = removeReportedReview(id);
    if (reviewId) removeReview(reviewId);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold md:text-4xl">{ADMIN_LABELS.dashboard.title}</h1>
        <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{ADMIN_LABELS.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label={ADMIN_LABELS.dashboard.totalUsers} value={totalUsers.toLocaleString()} icon={Users} />
        <Stat label={ADMIN_LABELS.dashboard.newUsersThisWeek} value={`+${newUsersThisWeek}`} icon={UserPlus} />
        <Stat label={ADMIN_LABELS.dashboard.totalInstructors} value={totalInstructors} icon={Users} />
        <Stat label={ADMIN_LABELS.dashboard.totalInstitutions} value={totalInstitutions} icon={Building} />
        <Stat label={ADMIN_LABELS.dashboard.totalClasses} value={totalClasses} icon={BookOpen} />
        <Stat label={ADMIN_LABELS.dashboard.upcomingClasses} value={upcomingClasses} icon={Calendar} />
        <Stat label={ADMIN_LABELS.dashboard.totalBookings} value={totalBookings} icon={Calendar} />
        <Stat
          label={ADMIN_LABELS.dashboard.totalRevenue}
          value={formatMoney({ amount: totalRevenueCents, currency: 'USD' })}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-[var(--fn-surface)] p-6 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Clock size={20} className="text-[var(--fn-primary)]" />
              {ADMIN_LABELS.dashboard.pendingVerifications}
              <Badge label={String(pendingVerifications.length)} variant="warning" />
            </h2>
          </div>
          <div className="space-y-4">
            {pendingVerifications.map((verification) => (
              <div key={`${verification.type}-${verification.id}`} className="rounded-xl border border-[var(--fn-border)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--fn-text)]">{verification.name}</p>
                    <p className="text-xs text-[var(--fn-text-muted)]">
                      {verification.type === 'instructor' ? ROLE_TITLES.instructor : ROLE_TITLES.institution}
                    </p>
                  </div>
                  <Badge label={ADMIN_LABELS.verification.pending} variant="warning" />
                </div>
                <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{verification.reason}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    title={ADMIN_LABELS.verification.verify}
                    size="sm"
                    onClick={() => verifyPending(verification.id, verification.type)}
                  >
                    <CheckCircle2 size={14} />
                  </Button>
                  <Button
                    title={ADMIN_LABELS.verification.reject}
                    variant="ghost"
                    size="sm"
                    onClick={() => rejectPending(verification.id)}
                  >
                    <XCircle size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {pendingVerifications.length === 0 && (
              <p className="py-8 text-center text-[var(--fn-text-muted)]">No hay verificaciones pendientes</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--fn-surface)] p-6 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <AlertCircle size={20} className="text-[var(--fn-primary)]" />
              {ADMIN_LABELS.dashboard.reportedReviews}
              <Badge label={String(reportedReviews.length)} variant="danger" />
            </h2>
          </div>
          <div className="space-y-4">
            {reportedReviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-[var(--fn-border)] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--fn-text)]">{review.authorName}</span>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <Badge label={`${review.reportCount} reportes`} variant="danger" />
                </div>
                <p className="mb-1 text-xs text-[var(--fn-text-muted)]">
                  {review.reportReasons.join(' · ')}
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
                  </Button>
                  <Button
                    title={ADMIN_LABELS.reviews.remove}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReview(review.id)}
                  >
                    <XCircle size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {reportedReviews.length === 0 && (
              <p className="py-8 text-center text-[var(--fn-text-muted)]">No hay reseñas reportadas</p>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl bg-[var(--fn-surface)] p-6">
            <h2 className="mb-4 text-xl font-bold">{ADMIN_LABELS.dashboard.quickActions}</h2>
            <div className="space-y-3">
              <Button className="w-full" size="md" onClick={() => router.push('/admin/users')}>
                <Users size={18} />
                {TAB_LABELS.admin.users}
              </Button>
              <Button className="w-full" variant="outline" size="md" onClick={() => router.push('/admin/reviews')}>
                <Star size={18} />
                {ADMIN_LABELS.reviews.moderationTitle}
              </Button>
              <Button className="w-full" variant="outline" size="md" onClick={() => router.push('/admin/institutions')}>
                <Building size={18} />
                {ADMIN_LABELS.verification.institutionTitle}
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--fn-surface)] p-6">
            <h2 className="mb-4 text-xl font-bold">{ADMIN_LABELS.dashboard.recentActivity}</h2>
            <div className="space-y-2">
              <ActivityItem
                user="Lucia Gomez"
                action="solicitó verificación como instructor"
                time="Hace 2 horas"
                icon={UserPlus}
              />
              <ActivityItem
                user="Miguel Lopez"
                action="reservó la clase Yoga Flow Matutino"
                time="Hace 4 horas"
                icon={Calendar}
              />
              <ActivityItem
                user="Sofia Martinez"
                action="escribió una reseña de 5 estrellas"
                time="Ayer"
                icon={Star}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--fn-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Clases recientes</h2>
          <Link href="/admin/classes" className="text-sm font-medium text-[var(--fn-primary)]">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...classes].reverse().slice(0, 3).map((c) => (
            <ClassCard key={c.id} item={c} showEdit editHref={`/admin/classes/${c.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
