'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ALERT_LABELS, GENERAL_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiCancelOpenGame,
  apiCreateOpenGame,
  apiJoinOpenGame,
  apiLeaveOpenGame,
  apiListOpenGameSports,
  apiListOpenGames,
} from '@/services/api';
import { ApiClientError } from '@/services/api-client';
import type { OpenGame, OpenGameSport } from '@/types/api';
import { courtSportLabel, localDateInputValue } from '@/utils/courts';

const FALLBACK_SPORTS: OpenGameSport[] = ['padel', 'football_5', 'football_7', 'football_11'];

function defaultCapacity(sport: string): number {
  return sport === 'padel' ? 4 : 10;
}

function toStartAt(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function OpenGamesBoard() {
  const { showNotice } = useNoticeModal();
  const [games, setGames] = useState<OpenGame[]>([]);
  const [sports, setSports] = useState<string[]>(FALLBACK_SPORTS);
  const [filterSport, setFilterSport] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<string>('padel');
  const [date, setDate] = useState(localDateInputValue(new Date(Date.now() + 3 * 86400000)));
  const [time, setTime] = useState('20:00');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(String(defaultCapacity('padel')));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiListOpenGames(
        filterSport ? { sportType: filterSport } : undefined,
      );
      setGames(data ?? []);
    } catch (err) {
      setGames([]);
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'No se pudieron cargar los partidos abiertos',
      );
    } finally {
      setLoading(false);
    }
  }, [filterSport]);

  useEffect(() => {
    apiListOpenGameSports()
      .then((res) => {
        if (res.data?.length) setSports(res.data);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!title.trim() || !date || !time) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'Completá título, fecha y hora.',
        variant: 'error',
      });
      return;
    }
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap < 2) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: 'La capacidad debe ser al menos 2.',
        variant: 'error',
      });
      return;
    }
    setSaving(true);
    try {
      await apiCreateOpenGame({
        sportType: sport,
        title: title.trim(),
        startAt: toStartAt(date, time),
        capacity: cap,
        locationLabel: location.trim() || undefined,
        durationMinutes: 90,
      });
      setTitle('');
      setLocation('');
      setShowForm(false);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Partido publicado.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo crear el partido',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const join = async (id: string) => {
    setActingId(id);
    try {
      await apiJoinOpenGame(id);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Te uniste al partido.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo unir',
        variant: 'error',
      });
    } finally {
      setActingId(null);
    }
  };

  const leave = async (id: string) => {
    setActingId(id);
    try {
      await apiLeaveOpenGame(id);
      await load();
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo salir',
        variant: 'error',
      });
    } finally {
      setActingId(null);
    }
  };

  const cancel = async (id: string) => {
    setActingId(id);
    try {
      await apiCancelOpenGame(id);
      await load();
      showNotice({
        title: ALERT_LABELS.savedTitle,
        message: 'Partido cancelado.',
        variant: 'success',
      });
    } catch (err) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: err instanceof ApiClientError ? err.message : 'No se pudo cancelar',
        variant: 'error',
      });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[10rem] flex-1">
          <Select
            label="Filtrar deporte"
            value={filterSport}
            onChange={setFilterSport}
            options={[
              { value: '', label: 'Todos' },
              ...sports.map((s) => ({ value: s, label: courtSportLabel(s) })),
            ]}
            compact
          />
        </div>
        <Button
          title={MOCK_V2V3_LABELS.openGamesCreate}
          onClick={() => setShowForm((v) => !v)}
        />
      </div>

      {showForm ? (
        <div className="space-y-3 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select
            label="Deporte"
            value={sport}
            onChange={(val) => {
              setSport(val);
              setCapacity(String(defaultCapacity(val)));
            }}
            options={sports.map((s) => ({ value: s, label: courtSportLabel(s) }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Fecha"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              compact
            />
            <Input
              label="Hora"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              compact
            />
            <Input
              label="Lugar"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              compact
            />
            <Input
              label="Cupos"
              type="number"
              min={2}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              compact
            />
          </div>
          <Button title="Publicar" loading={saving} onClick={() => void create()} />
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--fn-error)]">{error}</p> : null}
      {!loading && !error && games.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--fn-border)] px-4 py-10 text-center text-sm text-[var(--fn-text-muted)]">
          No hay partidos abiertos por ahora. Creá el primero.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {games.map((game) => {
          const joined = game.myStatus === 'joined';
          return (
            <article
              key={game.id}
              className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5"
            >
              <h3 className="m-0 font-bold text-[var(--fn-text)]">{game.title}</h3>
              <p className="mt-1 m-0 text-sm text-[var(--fn-text-muted)]">
                {courtSportLabel(String(game.sportType))}
                {game.locationLabel ? ` · ${game.locationLabel}` : ''}
                {game.institutionName ? ` · ${game.institutionName}` : ''}
              </p>
              <p className="mt-1 m-0 text-sm text-[var(--fn-text)]">
                {new Date(game.startAt).toLocaleString('es-UY')}
              </p>
              <p className="mt-2 m-0 flex items-center gap-1 text-sm font-medium">
                <Users size={16} />
                {MOCK_V2V3_LABELS.openGamesSlots(game.joinedCount, game.capacity)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!joined && game.spotsLeft > 0 && !game.isCreator ? (
                  <Button
                    title={MOCK_V2V3_LABELS.openGamesJoin}
                    size="sm"
                    loading={actingId === game.id}
                    onClick={() => void join(game.id)}
                  />
                ) : null}
                {joined && !game.isCreator ? (
                  <Button
                    title="Salir"
                    size="sm"
                    variant="outline"
                    loading={actingId === game.id}
                    onClick={() => void leave(game.id)}
                  />
                ) : null}
                {game.isCreator ? (
                  <Button
                    title="Cancelar partido"
                    size="sm"
                    variant="outline"
                    loading={actingId === game.id}
                    onClick={() => void cancel(game.id)}
                  />
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
