'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Radio, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LIVE_STREAM_LABELS } from '@/constants/labels';
import {
  apiEndClassStream,
  apiGetClassStreamStatus,
  apiJoinClassStream,
  apiLeaveClassStream,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { ClassStreamJoinResponse, ClassStreamStatusResponse, User } from '@/types/api';

const LiveStreamRoom = dynamic(
  () => import('@/components/live-stream/live-stream-room').then((m) => m.LiveStreamRoom),
  { ssr: false },
);

function statusLabel(status: ClassStreamStatusResponse['status']) {
  return LIVE_STREAM_LABELS.status[status] ?? status;
}

function statusBadgeClass(status: ClassStreamStatusResponse['status']) {
  if (status === 'live') {
    return 'bg-[var(--fn-primary-muted)] text-[var(--fn-primary-text)] ring-1 ring-[color-mix(in_srgb,var(--fn-primary)_25%,transparent)]';
  }
  if (status === 'ended' || status === 'cancelled') {
    return 'bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)]';
  }
  return 'bg-[color-mix(in_srgb,var(--fn-primary-muted)_70%,var(--fn-surface))] text-[var(--fn-primary-text)]';
}

export function ClassLiveStreamPanel({
  classId,
  user,
  autoJoin = false,
}: {
  classId: string;
  user: User | null;
  autoJoin?: boolean;
}) {
  const [status, setStatus] = useState<ClassStreamStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<ClassStreamJoinResponse | null>(null);
  const autoJoinAttempted = useRef(false);

  const refreshStatus = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await apiGetClassStreamStatus(classId);
      setStatus(next);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : LIVE_STREAM_LABELS.errorJoin;
      setError(message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (!user || joined) return undefined;
    const interval = window.setInterval(() => {
      void refreshStatus();
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [joined, refreshStatus, user]);

  const handleJoin = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const session = await apiJoinClassStream(classId);
      setJoined(session);
      setStatus(session);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : LIVE_STREAM_LABELS.errorJoin;
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!autoJoin || autoJoinAttempted.current || joined || actionLoading || !status?.canJoin) {
      return;
    }
    autoJoinAttempted.current = true;
    void handleJoin();
  }, [actionLoading, autoJoin, handleJoin, joined, status?.canJoin]);

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await apiLeaveClassStream(classId);
    } catch {
      /* best effort */
    } finally {
      setJoined(null);
      setActionLoading(false);
      void refreshStatus();
    }
  };

  const handleEnd = async () => {
    setActionLoading(true);
    try {
      await apiEndClassStream(classId);
      setJoined(null);
      await refreshStatus();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : LIVE_STREAM_LABELS.errorJoin;
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="rounded-2xl border border-[color-mix(in_srgb,var(--fn-primary)_18%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_35%,var(--fn-surface))] p-5">
        <div className="mb-2 flex items-center gap-2">
          <Video size={18} className="text-[var(--fn-primary)]" />
          <h3 className="m-0 text-sm font-extrabold text-[var(--fn-text)]">{LIVE_STREAM_LABELS.title}</h3>
        </div>
        <p className="m-0 text-sm text-[var(--fn-text-secondary)]">{LIVE_STREAM_LABELS.loginRequired}</p>
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(`/class/${classId}`)}`}
          className="mt-3 inline-flex text-sm font-semibold text-[var(--fn-primary-text)] hover:underline"
        >
          Iniciar sesión
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[color-mix(in_srgb,var(--fn-primary)_18%,var(--fn-border))] bg-[color-mix(in_srgb,var(--fn-primary-muted)_30%,var(--fn-surface))] p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Video size={18} className="text-[var(--fn-primary)]" />
          <h3 className="m-0 text-sm font-extrabold text-[var(--fn-text)]">{LIVE_STREAM_LABELS.title}</h3>
        </div>
        {status ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(status.status)}`}
          >
            {status.status === 'live' ? <Radio size={12} className="animate-pulse" /> : null}
            {statusLabel(status.status)}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="m-0 text-sm text-[var(--fn-text-muted)]">{LIVE_STREAM_LABELS.connecting}</p>
      ) : null}

      {error ? <p className="m-0 text-sm text-[var(--fn-error)]">{error}</p> : null}

      {status && !joined ? (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--fn-text-muted)]">Sala</dt>
            <dd className="font-mono text-xs font-semibold text-[var(--fn-text)]">{status.roomName}</dd>
          </div>
          {status.role ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--fn-text-muted)]">Tu rol</dt>
              <dd className="font-semibold text-[var(--fn-text)]">
                {status.role === 'host'
                  ? LIVE_STREAM_LABELS.roleHost
                  : LIVE_STREAM_LABELS.roleParticipant}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--fn-text-muted)]">Disponibilidad</dt>
            <dd className="font-semibold text-[var(--fn-text)]">
              {status.withinJoinWindow
                ? LIVE_STREAM_LABELS.windowOpen
                : LIVE_STREAM_LABELS.windowClosed}
            </dd>
          </div>
        </dl>
      ) : null}

      {status && !status.livekitConfigured ? (
        <p className="mt-3 m-0 text-sm text-[var(--fn-text-muted)]">{LIVE_STREAM_LABELS.notConfigured}</p>
      ) : null}

      {status && status.livekitConfigured && !status.role && !joined ? (
        <p className="mt-3 m-0 text-sm text-[var(--fn-text-muted)]">{LIVE_STREAM_LABELS.bookingRequired}</p>
      ) : null}

      {status && status.livekitConfigured && status.role && !status.withinJoinWindow && !joined ? (
        <p className="mt-3 m-0 text-sm text-[var(--fn-text-muted)]">{LIVE_STREAM_LABELS.outsideWindow}</p>
      ) : null}

      {status && (status.status === 'ended' || status.status === 'cancelled') && !joined ? (
        <p className="mt-3 m-0 text-sm text-[var(--fn-text-muted)]">{LIVE_STREAM_LABELS.sessionEnded}</p>
      ) : null}

      {joined ? (
        <div className="mt-4 space-y-3">
          <LiveStreamRoom
            url={joined.url}
            token={joined.token}
            canPublish={joined.canPublish}
            onDisconnected={() => {
              setJoined(null);
              void refreshStatus();
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              title={LIVE_STREAM_LABELS.leave}
              variant="secondary"
              loading={actionLoading}
              onClick={() => void handleLeave()}
            />
            {joined.role === 'host' && joined.status === 'live' ? (
              <Button
                title={LIVE_STREAM_LABELS.endSession}
                variant="danger"
                loading={actionLoading}
                onClick={() => void handleEnd()}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {status?.canJoin ? (
            <Button
              title={LIVE_STREAM_LABELS.join}
              loading={actionLoading}
              onClick={() => void handleJoin()}
            />
          ) : null}
          {status?.role === 'host' ? (
            <p className="m-0 self-center text-xs text-[var(--fn-text-muted)]">
              {LIVE_STREAM_LABELS.micCameraHint}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
