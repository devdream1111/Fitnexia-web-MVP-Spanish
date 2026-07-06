import { readMockJson, updateMockJson } from '@/services/mock/storage';
import type { MockReviewResponse } from '@/services/mock/seed';
import { seedReviewResponses } from '@/services/mock/seed';

const STORAGE_KEY = 'review_responses';

export const mockReviewResponsesService = {
  list(): MockReviewResponse[] {
    return readMockJson(STORAGE_KEY, seedReviewResponses);
  },

  getForReview(reviewId: string): string | null {
    const entry = mockReviewResponsesService.list().find((r) => r.reviewId === reviewId);
    return entry?.response ?? null;
  },

  save(reviewId: string, response: string): MockReviewResponse[] {
    return updateMockJson(STORAGE_KEY, seedReviewResponses, (entries) => {
      const existing = entries.find((e) => e.reviewId === reviewId);
      const next: MockReviewResponse = {
        reviewId,
        response: response.trim(),
        respondedAt: new Date().toISOString(),
      };
      if (existing) {
        return entries.map((e) => (e.reviewId === reviewId ? next : e));
      }
      return [...entries, next];
    });
  },
};

export type { MockReviewResponse };
