import { readMockJson, writeMockJson } from '@/services/mock/storage';

export interface MockInstructorProState {
  subscribed: boolean;
  subscribedAt: string | null;
  nextChargeAt: string | null;
}

function seed(): MockInstructorProState {
  return { subscribed: false, subscribedAt: null, nextChargeAt: null };
}

const KEY = 'instructor_pro';

export const mockInstructorProService = {
  get(instructorId: string): MockInstructorProState {
    return readMockJson(`${KEY}_${instructorId}`, seed);
  },

  subscribe(instructorId: string): MockInstructorProState {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    const state: MockInstructorProState = {
      subscribed: true,
      subscribedAt: new Date().toISOString(),
      nextChargeAt: next.toISOString(),
    };
    writeMockJson(`${KEY}_${instructorId}`, state);
    return state;
  },
};
