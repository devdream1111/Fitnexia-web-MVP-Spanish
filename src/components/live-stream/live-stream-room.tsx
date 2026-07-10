'use client';

import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

import { LIVE_STREAM_LABELS } from '@/constants/labels';

function attachTrack(track: Track, container: HTMLDivElement) {
  const element = track.attach();
  element.classList.add('h-full', 'w-full', 'object-cover');
  if (track.kind === Track.Kind.Audio) {
    element.classList.add('hidden');
  }
  container.appendChild(element);
  return element;
}

export function LiveStreamRoom({
  url,
  token,
  canPublish,
  onDisconnected,
}: {
  url: string;
  token: string;
  canPublish: boolean;
  onDisconnected: () => void;
}) {
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteGridRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    roomRef.current = room;

    const trackElements = new Map<string, HTMLElement>();

    function trackKey(track: Track) {
      return track.sid ?? `${track.kind}-${track.source}`;
    }

    function detachTrack(track: Track) {
      const elements = track.detach();
      elements.forEach((el) => el.remove());
      trackElements.delete(trackKey(track));
    }

    function renderParticipantTrack(track: Track, container: HTMLDivElement) {
      const key = trackKey(track);
      if (trackElements.has(key)) return;
      const element = attachTrack(track, container);
      trackElements.set(key, element);
    }

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (!remoteGridRef.current) return;
      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        renderParticipantTrack(track, remoteGridRef.current);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      detachTrack(track);
    });

    room.on(RoomEvent.Disconnected, () => {
      onDisconnected();
    });

    let cancelled = false;

    async function connect() {
      try {
        await room.connect(url, token);
        if (cancelled) return;
        setStatus('connected');

        if (canPublish && localVideoRef.current) {
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true);
          const videoPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
          const videoTrack = videoPublication?.track;
          if (videoTrack) {
            renderParticipantTrack(videoTrack, localVideoRef.current);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : LIVE_STREAM_LABELS.errorJoin);
      }
    }

    void connect();

    return () => {
      cancelled = true;
      room.disconnect();
      roomRef.current = null;
    };
  }, [canPublish, onDisconnected, token, url]);

  if (status === 'error') {
    return (
      <p className="m-0 text-sm text-[var(--fn-error)]">{errorMessage ?? LIVE_STREAM_LABELS.errorJoin}</p>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'connecting' ? (
        <p className="m-0 text-sm text-[var(--fn-text-muted)]">{LIVE_STREAM_LABELS.connecting}</p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {canPublish ? (
          <div className="overflow-hidden rounded-xl border border-[var(--fn-border)] bg-black/90">
            <p className="m-0 border-b border-white/10 px-3 py-2 text-xs font-semibold text-white/80">
              {LIVE_STREAM_LABELS.youAreHost}
            </p>
            <div ref={localVideoRef} className="aspect-video w-full bg-slate-900" />
          </div>
        ) : null}
        <div
          className={`overflow-hidden rounded-xl border border-[var(--fn-border)] bg-black/90 ${
            canPublish ? '' : 'md:col-span-2'
          }`}
        >
          <p className="m-0 border-b border-white/10 px-3 py-2 text-xs font-semibold text-white/80">
            Transmisión
          </p>
          <div
            ref={remoteGridRef}
            className="grid min-h-[12rem] grid-cols-1 gap-1 bg-slate-950 p-1 sm:grid-cols-2"
          />
        </div>
      </div>
    </div>
  );
}
