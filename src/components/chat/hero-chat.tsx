"use client";

import { useState, useRef, useCallback } from "react";
import { ChatResponse } from "./chat-response";
import { SolutionPills } from "./solution-pills";

type SolutionReference = {
  id: string;
  name: string;
};

export function HeroChat({ solutions }: { solutions: SolutionReference[] }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed || isStreaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setResponse("");
      setError(null);
      setIsStreaming(true);
      setIsOpen(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to get response");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setResponse(accumulated);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong. Please try again.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [query, isStreaming]
  );

  const handleClear = useCallback(() => {
    abortRef.current?.abort();
    setIsOpen(false);
    setResponse("");
    setError(null);
    setQuery("");
  }, []);

  const handleSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
  }, []);

  // Extract solution IDs mentioned in the response
  const mentionedSolutions = solutions.filter(
    (s) =>
      response.includes(s.id) ||
      response.toLowerCase().includes(s.name.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="card-static flex items-center gap-3 px-5 py-3 shadow-md">
          <span className="material-symbols-outlined text-blue-500 text-[22px]">
            auto_awesome
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI to find the right solution for you..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
            disabled={isStreaming}
          />
          {query.trim() && !isStreaming && (
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Ask
            </button>
          )}
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-blue-500">
              <span className="typing-dots">
                <span />
                <span />
                <span />
              </span>
              Thinking...
            </div>
          )}
        </div>
      </form>

      {/* Suggestion chips */}
      {!isOpen && !query && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {[
            "What helps reduce customer churn?",
            "Show me marketing automation tools",
            "Analytics for fraud detection",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestion(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 hover:border-slate-300 transition-all cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Response Area */}
      {isOpen && (
        <div className="mt-3 card-static p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-500">
                smart_toy
              </span>
              <span className="text-xs font-medium text-slate-500">
                AI Assistant
              </span>
            </div>
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <>
              <ChatResponse content={response} isStreaming={isStreaming} />
              {!isStreaming && mentionedSolutions.length > 0 && (
                <SolutionPills solutions={mentionedSolutions} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
