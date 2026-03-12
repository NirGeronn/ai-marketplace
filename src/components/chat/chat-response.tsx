"use client";

import Link from "next/link";
import { useMemo } from "react";

function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <strong key={key++} className="text-slate-900 font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3] && match[4]) {
      const href = match[4];
      if (href.startsWith("/")) {
        parts.push(
          <Link
            key={key++}
            href={href}
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            {match[3]}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            {match[3]}
          </a>
        );
      }
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function ChatResponse({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const rendered = useMemo(() => {
    return content.split("\n").map((line, i) => {
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-sm text-slate-700 leading-relaxed mb-1.5">
          {parseMarkdown(line)}
        </p>
      );
    });
  }, [content]);

  return (
    <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin">
      {rendered}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
      )}
    </div>
  );
}
