"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the assistant's answer as real HTML (headings, bold, lists,
 * blockquotes…) — never the raw markdown string. Styling lives in
 * globals.css under `.md` (body 15–16px, line-height ~1.75, high contrast).
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}