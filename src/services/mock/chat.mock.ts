import { readMockJson, updateMockJson } from '@/services/mock/storage';

export interface MockChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'instructor' | 'athlete';
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
}

export interface MockChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

function seedThreads(userId: string): MockChatThread[] {
  return [
    {
      id: 'mock-thread-1',
      participantId: 'inst-1',
      participantName: 'Ana García',
      participantRole: 'instructor',
      lastMessage: '¡Nos vemos en la clase del jueves!',
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      unread: true,
    },
  ];
}

function seedMessages(): MockChatMessage[] {
  return [
    {
      id: 'mock-msg-1',
      threadId: 'mock-thread-1',
      senderId: 'inst-1',
      body: 'Hola, ¿tenés alguna duda sobre la reserva?',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'mock-msg-2',
      threadId: 'mock-thread-1',
      senderId: 'me',
      body: 'Sí, ¿necesito traer mat?',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 'mock-msg-3',
      threadId: 'mock-thread-1',
      senderId: 'inst-1',
      body: '¡Nos vemos en la clase del jueves!',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

const THREADS_KEY = 'chat_threads';
const MESSAGES_KEY = 'chat_messages';

export const mockChatService = {
  listThreads(userId: string): MockChatThread[] {
    return readMockJson(`${THREADS_KEY}_${userId}`, () => seedThreads(userId));
  },

  getMessages(threadId: string): MockChatMessage[] {
    return readMockJson(MESSAGES_KEY, seedMessages).filter((m) => m.threadId === threadId);
  },

  sendMessage(threadId: string, senderId: string, body: string): MockChatMessage {
    const msg: MockChatMessage = {
      id: `mock-msg-${Date.now()}`,
      threadId,
      senderId,
      body,
      createdAt: new Date().toISOString(),
    };
    updateMockJson(MESSAGES_KEY, seedMessages, (prev) => [...prev, msg]);
    return msg;
  },
};
