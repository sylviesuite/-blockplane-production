import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthGate from "@/components/AuthGate";

const FREE_MESSAGE_LIMIT = 3;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "What's the lowest carbon insulation in the database?",
  "Compare bamboo flooring vs ceramic tile",
  "Which materials have RIS above 80?",
];

const LOADING_MESSAGES = [
  "Checking material database...",
  "Analyzing carbon data...",
  "Comparing lifecycle scores...",
];

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [freeCount, setFreeCount] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hitLimit = !user && freeCount >= FREE_MESSAGE_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 1200);
    return () => clearInterval(id);
  }, [loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || hitLimit) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    if (!user) setFreeCount((c) => c + 1);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />

      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-4 py-6">

        {/* Title */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-1">BlockPlane</p>
          <h1 className="text-2xl font-bold text-white">AI Builder's Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">
            Ask anything about LIS, RIS, CPI, or material comparisons.
          </p>
        </div>

        {/* Chat area */}
        <div className="flex-1 space-y-4 mb-4 min-h-[200px]">

          {isEmpty && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">Suggested prompts</p>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="block w-full text-left rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800/80 border border-slate-700/60 text-slate-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-800/80 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-400">{loadingMsg}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-rose-400 text-center">{error}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input — hidden behind auth gate once free limit is reached */}
        {hitLimit ? (
          <AuthGate message="Sign in to keep the conversation going — your first 3 messages are free." />
        ) : (
          <>
            <div className="flex gap-2 items-end rounded-2xl border border-slate-700/60 bg-slate-800/60 p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about LIS, RIS, CPI, or a material…"
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                style={{ maxHeight: "120px", overflowY: "auto" }}
                disabled={loading}
              />
              <Button
                size="sm"
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {!user && freeCount > 0 && (
              <p className="text-[11px] text-slate-500 text-center mt-1">
                {FREE_MESSAGE_LIMIT - freeCount} free {FREE_MESSAGE_LIMIT - freeCount === 1 ? "message" : "messages"} remaining
              </p>
            )}
            <p className="text-[11px] text-slate-600 text-center mt-1">
              Powered by claude-sonnet-4-6 · Shift+Enter for new line
            </p>
          </>
        )}
      </div>
    </div>
  );
}
