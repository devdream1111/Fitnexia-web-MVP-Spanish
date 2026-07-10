'use client';

import { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, MessageSquare } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ALERT_LABELS,
  GENERAL_LABELS,
  MOCK_V2V3_LABELS,
  SCREEN_TITLES,
} from '@/constants/labels';
import { apiCreateSupportTicket, apiGetMySupportTickets } from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import type { SupportTicket, SupportTicketStatus } from '@/types/api';

const SUPPORT_EMAIL = 'soporte@fitnexia.fit';

function statusLabel(status: SupportTicketStatus | string): string {
  const map = MOCK_V2V3_LABELS.supportStatus as Record<string, string>;
  return map[status] ?? status;
}

export function PlatformSupportPage({
  backHref = '/athlete/profile',
  tier = 'standard',
}: {
  backHref?: string;
  tier?: 'standard' | 'priority' | 'dedicated';
}) {
  const { showNotice } = useNoticeModal();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiGetMySupportTickets();
      setTickets(data ?? []);
      setApiAvailable(true);
    } catch (err) {
      if (err instanceof ApiClientError && (err.status === 404 || err.status === 501)) {
        setApiAvailable(false);
        setTickets([]);
      } else {
        setApiAvailable(true);
        setTickets([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Completá asunto y mensaje.',
        variant: 'error',
      });
      return;
    }

    if (!apiAvailable) {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.trim())}`;
      return;
    }

    setSending(true);
    try {
      await apiCreateSupportTicket({
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject('');
      setMessage('');
      await loadTickets();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.supportTicketSent,
        variant: 'success',
      });
    } catch (err) {
      if (err instanceof ApiClientError && (err.status === 404 || err.status === 501)) {
        setApiAvailable(false);
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.trim())}`;
        return;
      }
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo enviar el ticket',
        variant: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader
        variant="premium"
        title={MOCK_V2V3_LABELS.supportTitle}
        eyebrow={GENERAL_LABELS.athleteSupportEyebrow}
        subtitle={GENERAL_LABELS.athleteSupportSubtitle}
        showBack
        backHref={backHref}
      />

      {tier === 'priority' ? (
        <span className="inline-flex rounded-full bg-[var(--fn-primary-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--fn-primary-text)]">
          {MOCK_V2V3_LABELS.prioritySupportBadge}
        </span>
      ) : null}
      {tier === 'dedicated' ? (
        <p className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-4 py-3 text-sm text-[var(--fn-text-muted)]">
          Contacto dedicado: <strong>maria.enterprise@fitnexia.fit</strong>
        </p>
      ) : null}

      {!apiAvailable ? (
        <p className="rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-4 py-3 text-sm text-[var(--fn-text-muted)]">
          El centro de tickets aún no está disponible en el servidor. Podés escribirnos a{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[var(--fn-primary-text)]">
            {SUPPORT_EMAIL}
          </a>{' '}
          o usar el formulario (abre tu correo).
        </p>
      ) : null}

      <section className="rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            <LifeBuoy size={22} />
          </span>
          <h2 className="m-0 font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.supportNewTicket}</h2>
        </div>
        <div className="space-y-4">
          <Input
            label={MOCK_V2V3_LABELS.supportSubject}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            label={MOCK_V2V3_LABELS.supportMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <Button
            title={apiAvailable ? MOCK_V2V3_LABELS.supportSubmit : 'Enviar por correo'}
            loading={sending}
            onClick={() => void submit()}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="m-0 flex items-center gap-2 font-bold text-[var(--fn-text)]">
          <MessageSquare size={18} />
          Mis tickets
        </h3>
        {loading ? (
          <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
        ) : null}
        {!loading && apiAvailable && tickets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--fn-border)] px-4 py-8 text-center text-sm text-[var(--fn-text-muted)]">
            Todavía no tenés tickets.
          </p>
        ) : null}
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="rounded-3xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="m-0 font-semibold text-[var(--fn-text)]">{ticket.subject}</h4>
              <span className="rounded-full bg-[var(--fn-surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--fn-text-muted)]">
                {statusLabel(ticket.status)}
              </span>
            </div>
            <p className="mt-2 m-0 text-sm text-[var(--fn-text-muted)]">{ticket.message}</p>
            <p className="mt-2 m-0 text-xs text-[var(--fn-text-muted)]">
              {new Date(ticket.createdAt).toLocaleDateString('es-UY')}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function PlatformSupportPlaceholderPage({
  backHref = '/athlete/profile',
}: {
  backHref?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-4">
      <PageHeader variant="premium" title={SCREEN_TITLES.helpSupport} showBack backHref={backHref} />
      <p className="rounded-3xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/30 px-6 py-10 text-center text-sm text-[var(--fn-text-muted)]">
        El soporte por tickets estará disponible próximamente. Escribinos a{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[var(--fn-primary-text)]">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
