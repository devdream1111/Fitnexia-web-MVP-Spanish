import { readMockJson, updateMockJson } from '@/services/mock/storage';
import type { MockSupportTicket } from '@/services/mock/seed';

const STORAGE_KEY = 'support_tickets';

function seedTickets(): MockSupportTicket[] {
  return [
    {
      id: 'mock-ticket-1',
      subject: 'Consulta sobre reembolso',
      message: 'Reservé una clase y necesito cancelar por enfermedad.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];
}

export const mockSupportService = {
  list(): MockSupportTicket[] {
    return readMockJson(STORAGE_KEY, seedTickets);
  },

  create(subject: string, message: string): MockSupportTicket {
    return updateMockJson(STORAGE_KEY, seedTickets, (tickets) => {
      const ticket: MockSupportTicket = {
        id: `mock-ticket-${Date.now()}`,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [ticket, ...tickets];
    }).find((t) => t.status === 'open' && t.subject === subject.trim())!;
  },
};

export type { MockSupportTicket };
