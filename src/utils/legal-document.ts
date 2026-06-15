export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface ParsedLegalDocument {
  title: string;
  updated?: string;
  sections: LegalSection[];
}

const SECTION_HEADING = /^\d+\.\s+/;

function flushParagraph(paragraphs: string[], blocks: LegalBlock[]) {
  const text = paragraphs.join(' ').trim();
  if (text) blocks.push({ type: 'paragraph', text });
  paragraphs.length = 0;
}

function flushList(items: string[], blocks: LegalBlock[]) {
  if (items.length > 0) blocks.push({ type: 'list', items: [...items] });
  items.length = 0;
}

export function slugifyLegalHeading(heading: string): string {
  return heading
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseLegalDocument(raw: string): ParsedLegalDocument {
  const lines = raw
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const title = lines[0] ?? 'Documento legal';
  const updated = lines[1]?.toLowerCase().includes('actualización') ? lines[1] : undefined;
  const bodyStart = updated ? 2 : 1;

  const sections: LegalSection[] = [];
  let currentSection: LegalSection | null = null;
  let paragraphs: string[] = [];
  let listItems: string[] = [];

  for (let i = bodyStart; i < lines.length; i += 1) {
    const line = lines[i];

    if (SECTION_HEADING.test(line)) {
      flushParagraph(paragraphs, currentSection?.blocks ?? []);
      flushList(listItems, currentSection?.blocks ?? []);
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: line, blocks: [] };
      continue;
    }

    if (!currentSection) {
      currentSection = { heading: 'General', blocks: [] };
    }

    if (line.startsWith('* ')) {
      flushParagraph(paragraphs, currentSection.blocks);
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList(listItems, currentSection.blocks);
    paragraphs.push(line);
  }

  if (currentSection) {
    flushParagraph(paragraphs, currentSection.blocks);
    flushList(listItems, currentSection.blocks);
    sections.push(currentSection);
  }

  return { title, updated, sections };
}
