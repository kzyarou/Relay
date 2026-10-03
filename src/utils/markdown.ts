export type Block =
{type: 'h3';text: string;} |
{type: 'p';text: string;} |
{type: 'ul';items: string[];} |
{type: 'ol';items: string[];};

/** Tiny markdown parser covering what assistant replies use: headings, paragraphs and lists. */
export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith('### ')) {
      flush();
      blocks.push({ type: 'h3', text: line.slice(4) });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)/);
    if (bullet) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'ul') last.items.push(bullet[1]);else
      blocks.push({ type: 'ul', items: [bullet[1]] });
      continue;
    }
    const numbered = line.match(/^\d+\.\s+(.*)/);
    if (numbered) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'ol') last.items.push(numbered[1]);else
      blocks.push({ type: 'ol', items: [numbered[1]] });
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Splits text into plain and **bold** segments. */
export function splitBold(text: string): {text: string;bold: boolean;}[] {
  return text.
  split(/(\*\*[^*]+\*\*)/g).
  filter(Boolean).
  map((part) =>
  part.startsWith('**') && part.endsWith('**') && part.length > 4 ?
  { text: part.slice(2, -2), bold: true } :
  { text: part, bold: false }
  );
}