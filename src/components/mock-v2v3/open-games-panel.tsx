'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ALERT_LABELS, MOCK_V2V3_LABELS } from '@/constants/labels';
import { mockOpenGamesService, type OpenGameSport } from '@/services/mock/open-games.mock';
import { useNoticeModal } from '@/contexts/notice-modal-context';

export function OpenGamesBoard({ userId, userName }: { userId: string; userName: string }) {
  const { showNotice } = useNoticeModal();
  const [games, setGames] = useState(() => mockOpenGamesService.list());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<OpenGameSport>('padel');

  const join = (gameId: string) => {
    const g = mockOpenGamesService.join(gameId, userId);
    if (g) {
      setGames(mockOpenGamesService.list());
      showNotice({ title: ALERT_LABELS.savedTitle, message: 'Te uniste al partido.', variant: 'success' });
    }
  };

  const create = () => {
    if (!title.trim()) return;
    const d = new Date();
    d.setDate(d.getDate() + 3);
    mockOpenGamesService.create(userId, userName, {
      sport,
      title: title.trim(),
      location: 'A definir',
      date: d.toISOString().slice(0, 10),
      startTime: '20:00',
      slotsTotal: sport === 'padel' ? 4 : 10,
    });
    setGames(mockOpenGamesService.list());
    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Button title={MOCK_V2V3_LABELS.openGamesCreate} onClick={() => setShowForm((v) => !v)} />
      {showForm ? (
        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5 space-y-3">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select
            label="Deporte"
            value={sport}
            onChange={(val) => setSport(val as OpenGameSport)}
            options={[
              { value: 'padel', label: 'Pádel' },
              { value: 'football_5', label: 'Fútbol 5' },
            ]}
          />
          <Button title="Publicar" onClick={create} />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {games.map((g) => (
          <article key={g.id} className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-5">
            <h3 className="font-bold">{g.title}</h3>
            <p className="mt-1 text-sm text-[var(--fn-text-muted)]">{g.location}</p>
            <p className="mt-1 text-sm">{g.date} · {g.startTime}</p>
            <p className="mt-2 flex items-center gap-1 text-sm font-medium">
              <Users size={16} />
              {MOCK_V2V3_LABELS.openGamesSlots(g.slotsFilled, g.slotsTotal)}
            </p>
            <p className="text-xs text-[var(--fn-text-muted)]">Organiza {g.hostName}</p>
            {g.slotsFilled < g.slotsTotal && !g.joinedUserIds.includes(userId) ? (
              <Button title={MOCK_V2V3_LABELS.openGamesJoin} size="sm" className="mt-3" onClick={() => join(g.id)} />
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
