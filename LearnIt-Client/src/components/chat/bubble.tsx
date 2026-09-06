import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, User } from "lucide-react"

interface BubbleProps {
  message: string
  sender: "user" | "assistant"
}

// Helper untuk merender <br> jika ada di dalam teks markdown (misal dalam tabel)
const renderWithLineBreaks = (text: string) => {
  if (!text.includes("<br")) return text
  const parts = text.split(/<br\s*\/?>/gi)
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {part}
    </React.Fragment>
  ))
}

const Bubble: React.FC<BubbleProps> = ({ message, sender }) => {
  return (
    <div
      className={`flex ${
        sender === "assistant" ? "flex-row" : "flex-row-reverse"
      } gap-3 items-start px-4 md:px-6 py-2`}
    >
      <div
        className={`p-2 rounded-full shrink-0 shadow-xs ${
          sender === "user"
            ? "bg-blue-600 text-white"
            : "bg-slate-700 dark:bg-slate-800 text-slate-100"
        }`}
      >
        {sender === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div
        className={`p-4 rounded-xl max-w-3xl overflow-hidden leading-relaxed ${
          sender === "user"
            ? "bg-blue-600 text-white whitespace-pre-wrap break-words"
            : "bg-slate-800/90 text-slate-100 border border-slate-700/80 shadow-xs"
        }`}
      >
        {sender === "user" ? (
          message
        ) : (
          <div className="prose prose-invert max-w-none text-sm break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-100">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-5 mb-3 space-y-1 text-slate-100">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-5 mb-3 space-y-1 text-slate-100">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-slate-700 bg-slate-900/60 shadow-xs">
                    <table className="min-w-full divide-y divide-slate-700 text-sm text-left">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-900/90 text-slate-200 font-semibold uppercase text-xs tracking-wider">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-3.5 py-2.5 border-b border-slate-700 font-semibold">
                    {children}
                  </th>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-slate-800/80">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    {children}
                  </tr>
                ),
                td: ({ children }) => (
                  <td className="px-3.5 py-2.5 align-top text-slate-200 leading-relaxed">
                    {Array.isArray(children)
                      ? children.map((child, idx) =>
                          typeof child === "string" ? (
                            <React.Fragment key={idx}>
                              {renderWithLineBreaks(child)}
                            </React.Fragment>
                          ) : (
                            child
                          )
                        )
                      : typeof children === "string"
                      ? renderWithLineBreaks(children)
                      : children}
                  </td>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-xs text-amber-300 border border-slate-700/60">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="p-3.5 my-2.5 rounded-lg bg-slate-950 overflow-x-auto font-mono text-xs border border-slate-700">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-400 pl-3 my-2 italic text-slate-300">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bubble