import React, { useMemo } from 'react';
import { parseBlocks, splitBold } from '../../utils/markdown';

interface MarkdownBlocksProps {
  text: string;
  className?: string;
}

export function MarkdownBlocks({ text, className = '' }: MarkdownBlocksProps) {
  const blocks = useMemo(() => parseBlocks(text), [text]);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.type === 'h3')
        return (
          <h3 key={i} className="pt-2 text-lg font-semibold leading-7">
              <Inline text={block.text} />
            </h3>);

        if (block.type === 'ul')
        return (
          <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-gpt-text">
              {block.items.map((item, j) =>
            <li key={j} className="pl-1">
                  <Inline text={item} />
                </li>
            )}
            </ul>);

        if (block.type === 'ol')
        return (
          <ol key={i} className="list-decimal space-y-1.5 pl-6">
              {block.items.map((item, j) =>
            <li key={j} className="pl-1">
                  <Inline text={item} />
                </li>
            )}
            </ol>);

        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>);

      })}
    </div>);

}

function Inline({ text }: {text: string;}) {
  return (
    <>
      {splitBold(text).map((part, i) =>
      part.bold ?
      <strong key={i} className="font-semibold">
            {part.text}
          </strong> :

      <React.Fragment key={i}>{part.text}</React.Fragment>

      )}
    </>);

}