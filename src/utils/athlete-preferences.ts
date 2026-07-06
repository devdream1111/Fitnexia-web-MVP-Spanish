import type { ClassLevel } from '@/types/api';

const TRAINING_LEVEL_KEY = 'fitnexia_athlete_training_level';

export function getAthleteTrainingLevel(): ClassLevel | '' {
  if (typeof window === 'undefined') return '';
  const value = localStorage.getItem(TRAINING_LEVEL_KEY);
  if (value === 'beginner' || value === 'intermediate' || value === 'advanced') {
    return value;
  }
  return '';
}

export function setAthleteTrainingLevel(level: ClassLevel | ''): void {
  if (typeof window === 'undefined') return;
  if (!level) {
    localStorage.removeItem(TRAINING_LEVEL_KEY);
    return;
  }
  localStorage.setItem(TRAINING_LEVEL_KEY, level);
}
