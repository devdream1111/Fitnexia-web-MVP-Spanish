'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Wallet } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiDisconnectMp,
  apiGetMpConnectStatus,
  apiGetMpConnectUrl,
  type MpConnectStatus,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import { PAYOUT_ACCOUNT_LABELS } from '@/constants/labels';
import { pollUntil, type PollHandle } from '@/utils/payment-polling';
import { formatClassDate } from '@/utils/format';

const L = PAYOUT_ACCOUNT_LABELS;

function statusLabel(status?: string, connected?: boolean): string {
  if (connected) return L.statusConnected;
  if (status === 'revoked') return L.statusRevoked;
  return L.statusDisconnected;
}

export function PayoutAccountPageContent() {
  const { showNotice } = useNoticeModal();
  const [status, setStatus] = useState<MpConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'connect' | 'disconnect' | null>(null);
  const [waitingAuth, setWaitingAuth] = useState(false);
  const pollRef = useRef<PollHandle | null>(null);

  const stopPolling = useCallback(() => {
    pollRef.current?.cancel();
    pollRef.current = null;
    setWaitingAuth(false);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await apiGetMpConnectStatus();
      setStatus(data);
      return data;
    } catch {
      setStatus(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      pollRef.current?.cancel();
    };
  }, [load]);

  const connected = status?.connection.connected ?? false;
  const oauthConfigured = status?.oauth.configured ?? false;

  const handleConnect = async () => {
    if (!oauthConfigured) {
      showNotice({
        title: L.connectNoticeTitle,
        message: L.connectNoticeMessage,
        variant: 'info',
      });
      return;
    }

    setBusy('connect');
    try {
      const { url } = await apiGetMpConnectUrl();
      window.open(url, '_blank', 'noopener');
      // The OAuth callback redirects to the mobile deep link, so on web we
      // confirm the connection by polling until the seller shows as connected.
      setWaitingAuth(true);
      pollRef.current?.cancel();
      pollRef.current = pollUntil(
        async () => {
          const data = await load();
          return Boolean(data?.connection.connected);
        },
        {
          onSuccess: () => {
            setWaitingAuth(false);
            showNotice({
              title: L.connectedNoticeTitle,
              message: L.connectedNoticeMessage,
              variant: 'success',
            });
          },
          onTimeout: () => setWaitingAuth(false),
        },
      );
    } catch (error) {
      showNotice({
        title: L.connectNoticeTitle,
        message: error instanceof ApiClientError ? error.message : L.connectError,
        variant: 'error',
      });
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async () => {
    setBusy('disconnect');
    stopPolling();
    try {
      const { connection } = await apiDisconnectMp();
      setStatus((prev) => (prev ? { ...prev, connection } : prev));
      showNotice({
        title: L.disconnectedNoticeTitle,
        message: L.disconnectedNoticeMessage,
        variant: 'success',
      });
    } catch (error) {
      showNotice({
        title: L.disconnectedNoticeTitle,
        message: error instanceof ApiClientError ? error.message : L.disconnectError,
        variant: 'error',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col">
      <PageHeader title={L.title} showBack />

      <p className="mb-8 text-sm leading-relaxed text-[var(--fn-text-muted)]">{L.intro}</p>

      <section className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
              connected
                ? 'border-[var(--fn-success)]/30 bg-[var(--fn-success)]/10 text-[var(--fn-success)]'
                : 'border-[var(--fn-primary)]/20 bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]'
            }`}
          >
            {connected ? (
              <CheckCircle2 size={24} strokeWidth={1.75} />
            ) : (
              <Wallet size={24} strokeWidth={1.75} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-[var(--fn-text)]">{L.provider}</p>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">
              {L.statusLabel}:{' '}
              <span
                className={`font-medium ${
                  connected ? 'text-[var(--fn-success)]' : 'text-[var(--fn-text-secondary)]'
                }`}
              >
                {loading ? '…' : statusLabel(status?.connection.status, connected)}
              </span>
            </p>

            {connected ? (
              <div className="mt-3 space-y-1 text-sm text-[var(--fn-text-secondary)]">
                {status?.connection.collectorId ? (
                  <p>
                    {L.collectorLabel}:{' '}
                    <span className="font-medium">{status.connection.collectorId}</span>
                  </p>
                ) : null}
                {status?.connection.connectedAt ? (
                  <p>
                    {L.connectedAtLabel}: {formatClassDate(status.connection.connectedAt)}
                  </p>
                ) : null}
                <p className="pt-1 text-xs leading-relaxed text-[var(--fn-text-muted)]">
                  {L.connectedBenefit}
                </p>
              </div>
            ) : null}

            {!loading && !connected && !oauthConfigured ? (
              <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--fn-primary)]">
                {L.marketplacePending}
              </p>
            ) : null}

            {waitingAuth ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--fn-primary)]">
                <Loader2 size={16} className="animate-spin" />
                {L.waitingAuth}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-auto space-y-3 pt-10">
        {connected ? (
          <Button
            title={L.disconnect}
            variant="outline"
            className="w-full"
            size="md"
            loading={busy === 'disconnect'}
            onClick={handleDisconnect}
          />
        ) : (
          <Button
            title={status?.connection.status === 'revoked' ? L.reconnect : L.connect}
            className="w-full"
            size="md"
            loading={busy === 'connect'}
            disabled={loading}
            onClick={handleConnect}
          />
        )}
      </div>
    </div>
  );
}
