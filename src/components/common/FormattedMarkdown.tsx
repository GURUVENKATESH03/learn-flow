import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

// Parses inline Markdown elements: **bold**, *italic*, `code`
export const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  // Regex to match `code`, **bold**, *italic*
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline code: `something`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] border border-indigo-200/60 dark:border-indigo-800/50"
        >
          {codeText}
        </code>
      );
    }

    // Bold text: **something**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {boldText}
        </strong>
      );
    }

    // Italic text: *something*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic text-slate-600 dark:text-slate-300">
          {italicText}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines to parse block elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check for code blocks ```
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        elements.push(
          <div
            key={`codeblock-${i}`}
            className="my-3 p-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner"
          >
            {codeBlockLang && (
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold border-b border-slate-800 pb-1">
                {codeBlockLang}
              </div>
            )}
            <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        // Open code block
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Empty line / paragraph break
    if (!line) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Horizontal Rule: --- or ***
    if (line === '---' || line === '***' || line === '___') {
      elements.push(
        <hr key={`hr-${i}`} className="my-3 border-t border-slate-200 dark:border-slate-800" />
      );
      continue;
    }

    // Headings: ### H3, ## H2, # H1
    if (line.startsWith('### ')) {
      const headingText = line.slice(4).trim();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm font-extrabold text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 inline-block" />
          <span>{renderInlineMarkdown(headingText)}</span>
        </h3>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      const headingText = line.slice(3).trim();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base font-extrabold text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800"
        >
          {renderInlineMarkdown(headingText)}
        </h2>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      const headingText = line.slice(2).trim();
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2"
        >
          {renderInlineMarkdown(headingText)}
        </h1>
      );
      continue;
    }

    // Blockquote: > something
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '').trim();
      elements.push(
        <div
          key={`quote-${i}`}
          className="my-2.5 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-500 dark:border-indigo-400 text-xs text-slate-700 dark:text-slate-200 shadow-2xs leading-relaxed"
        >
          {renderInlineMarkdown(quoteText)}
        </div>
      );
      continue;
    }

    // Bullet Lists: * item or - item
    if (line.startsWith('* ') || line.startsWith('- ')) {
      const itemText = line.slice(2).trim();
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-[13px] leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 mt-1.5" />
          <span className="flex-1 text-slate-700 dark:text-slate-200">{renderInlineMarkdown(itemText)}</span>
        </div>
      );
      continue;
    }

    // Numbered Lists: 1. item, 2. item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const itemText = numberedMatch[2];
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-1 text-xs sm:text-[13px] leading-relaxed">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 min-w-[18px]">
            {num}.
          </span>
          <span className="flex-1 text-slate-700 dark:text-slate-200">{renderInlineMarkdown(itemText)}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
        {renderInlineMarkdown(rawLine)}
      </p>
    );
  }

  // If unclosed code block at end of message
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <div
        key="codeblock-end"
        className="my-3 p-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800"
      >
        <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
      </div>
    );
  }

  return <div className={`space-y-1 font-sans ${className}`}>{elements}</div>;
};
