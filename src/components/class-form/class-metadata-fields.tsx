'use client';

import { Select } from '@/components/ui/select';
import { CLASS_LANGUAGES, CLASS_LEVELS } from '@/constants/fitnexia';
import { ADVANCED_SEARCH_LABELS, INSTRUCTOR_LABELS } from '@/constants/labels';
import type { ClassLevel } from '@/types/api';

export function ClassMetadataFields({
  level,
  language,
  onLevelChange,
  onLanguageChange,
}: {
  level: ClassLevel | '';
  language: string;
  onLevelChange: (value: ClassLevel | '') => void;
  onLanguageChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label={ADVANCED_SEARCH_LABELS.level}
        value={level}
        onChange={(value) => onLevelChange((value as ClassLevel) || '')}
        options={[
          { value: '', label: ADVANCED_SEARCH_LABELS.anyLevel },
          ...CLASS_LEVELS.map((item) => ({ value: item.id, label: item.label })),
        ]}
      />
      <Select
        label={INSTRUCTOR_LABELS.classForm.language}
        value={language}
        onChange={onLanguageChange}
        options={[
          { value: '', label: ADVANCED_SEARCH_LABELS.anyLanguage },
          ...CLASS_LANGUAGES.map((item) => ({ value: item.id, label: item.label })),
        ]}
      />
    </div>
  );
}
