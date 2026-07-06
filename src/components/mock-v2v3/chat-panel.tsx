'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { mockChatService } from '@/services/mock/chat.mock';

export function ChatInbox({ userId }: { userId: string }) {
  const [threads] = useState(() => mockChatService.listThreads(userId));
  const [activeId, setActiveId] = useState(threads[0]?.id ?? '');
  const [messages, setMessages] = useState(() =>
    activeId ? mockChatService.getMessages(activeId) : [],
  );
  const [draft, setDraft] = useState('');

  const selectThread = (id: string) => {
    setActiveId(id);
    setMessages(mockChatService.getMessages(id));
  };

  const send = () => {
    if (!draft.trim() || !activeId) return;
    const msg = mockChatService.sendMessage(activeId, userId, draft.trim());
    setMessages((prev) => [...prev, msg]);
    setDraft('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="space-y-1 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-2">
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectThread(t.id)}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
              t.id === activeId ? 'bg-[var(--fn-primary-muted)] font-semibold' : 'hover:bg-[var(--fn-surface-muted)]'
            }`}
          >
            {t.participantName}
            {t.unread ? <span className="ml-1 text-[var(--fn-primary)]">•</span> : null}
          </button>
        ))}
      </aside>
      <div className="flex min-h-[320px] flex-col rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)]">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.senderId === userId || m.senderId === 'me'
                  ? 'ml-auto bg-[var(--fn-primary)] text-white'
                  : 'bg-[var(--fn-surface-muted)] text-[var(--fn-text)]'
              }`}
            >
              {m.body}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-[var(--fn-border)] p-3">
          <Input
            label=""
            placeholder={MOCK_V2V3_LABELS.chatPlaceholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <Button title={MOCK_V2V3_LABELS.chatSend} onClick={send} />
        </div>
      </div>
    </div>
  );
}
