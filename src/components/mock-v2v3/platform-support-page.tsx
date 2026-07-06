'use client';

import { useState } from 'react';
import { LifeBuoy, MessageSquare } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ALERT_LABELS, MOCK_V2V3_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { mockSupportService } from '@/services/mock/support.mock';
import { MockDataBadge } from '@/components/mock-v2v3/mock-data-badge';
import { useNoticeModal } from '@/contexts/notice-modal-context';

export function PlatformSupportPage({
  tier = 'standard',
}: {
  tier?: 'standard' | 'priority' | 'dedicated';
}) {
  const { showNotice } = useNoticeModal();
  const [tickets, setTickets] = useState(() => mockSupportService.list());
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Completá asunto y mensaje.',
        variant: 'error',
      });
      return;
    }
    setSending(true);
    try {
      mockSupportService.create(subject, message);
      setTickets(mockSupportService.list());
      setSubject('');
      setMessage('');
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: MOCK_V2V3_LABELS.supportTicketSent,
        variant: 'success',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={MOCK_V2V3_LABELS.supportTitle} showBack />
      <div className="flex flex-wrap items-center gap-2">
        <MockDataBadge />
        {tier === 'priority' ? (
          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
            {MOCK_V2V3_LABELS.prioritySupportBadge}
          </span>
        ) : null}
        {tier === 'dedicated' ? (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-200">
            {MOCK_V2V3_LABELS.dedicatedSupportTitle}
          </span>
        ) : null}
      </div>
      {tier === 'dedicated' ? (
        <p className="text-sm text-[var(--fn-text-muted)]">
          Contacto dedicado: <strong>maria.enterprise@fitnexia.fit</strong> · Respuesta en menos de 4h (simulado).
        </p>
      ) : null}

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
        <div className="mb-4 flex items-center gap-3">
          <LifeBuoy size={22} className="text-[var(--fn-primary)]" />
          <h2 className="font-bold text-[var(--fn-text)]">{MOCK_V2V3_LABELS.supportNewTicket}</h2>
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
          <Button title={MOCK_V2V3_LABELS.supportSubmit} loading={sending} onClick={() => void submit()} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 font-bold text-[var(--fn-text)]">
          <MessageSquare size={18} />
          Mis tickets
        </h3>
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-semibold text-[var(--fn-text)]">{ticket.subject}</h4>
              <span className="rounded-full bg-[var(--fn-surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--fn-text-muted)]">
                {MOCK_V2V3_LABELS.supportStatus[ticket.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--fn-text-muted)]">{ticket.message}</p>
            <p className="mt-2 text-xs text-[var(--fn-text-muted)]">
              {new Date(ticket.createdAt).toLocaleDateString('es-UY')}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function PlatformSupportPlaceholderPage() {
  return (
    <div>
      <PageHeader title={SCREEN_TITLES.helpSupport} showBack />
      <p className="text-[var(--fn-text-muted)]">Support tickets — coming in a future release.</p>
    </div>
  );
}
