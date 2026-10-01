import { useEffect, useRef, useState } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { answerQuestion } from "@/lib/contracts";

export type Msg = { role: "user" | "assistant"; text: string; citations?: number[]; table?: boolean };

export function Md({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (line.trim() === "---") return <hr key={i} className="my-2" />;
        if (!line.trim()) return null;
        const html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
        if (line.startsWith("- ")) return <div key={i} className="flex gap-2 pl-1"><span className="text-muted-foreground">•</span><span dangerouslySetInnerHTML={{ __html: html.slice(2) }} /></div>;
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

export function ChatPanel({ clauses, prefill, onCite, suggestions, withTable }: {
  clauses: { name: string; compliance: number }[]; prefill?: string; onCite?: (page: number) => void; suggestions?: string[]; withTable?: boolean;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: "Hi — I'm the compliance assistant. Ask about any clause, or ask how to improve a compliance score." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const last = useRef<string | undefined>(undefined);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      const a = answerQuestion(q, clauses);
      setMsgs((m) => [...m, { role: "assistant", text: a.text, citations: a.citations, table: withTable && /rate|fee|awp/i.test(q) }]);
      setTyping(false);
    }, 700);
  };

  useEffect(() => { if (prefill && prefill !== last.current) { last.current = prefill; ask(prefill); } }, [prefill]); // eslint-disable-line
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, typing]);

  const sugg = suggestions ?? ["Why is Termination Without Cause 68%?", "What changes would improve compliance?", "Summarize the rate schedule", "What are the HIPAA obligations?"];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-8 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground" : "flex gap-2"}>
            {m.role === "assistant" ? (<>
              <Bot className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
              <div className="min-w-0 flex-1">
                <Md text={m.text} />
                {m.table && (
                  <table className="mt-2 w-full border text-xs"><tbody>
                    {[["Retail 30 Generic", "AWP − 82%"], ["Retail 30 Brand", "AWP − 19%"], ["Specialty Brand", "AWP − 21%"]].map(([a, b]) => <tr key={a} className="border-b"><td className="px-2 py-1">{a}</td><td className="px-2 py-1 font-mono">{b}</td></tr>)}
                  </tbody></table>
                )}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">{m.citations.map((p) => (
                    <button key={p} onClick={() => onCite?.(p)} className="rounded-sm border bg-muted px-1.5 py-0.5 font-mono text-[11px] hover:bg-accent">p. {p}</button>
                  ))}</div>
                )}
              </div></>) : m.text}
          </div>
        ))}
        {typing && <div className="text-xs text-muted-foreground">Assistant is thinking…</div>}
        <div ref={end} />
      </div>
      <div className="border-t p-2">
        <div className="mb-2 flex flex-wrap gap-1">{sugg.map((s) => <button key={s} onClick={() => ask(s)} className="rounded-full border px-2 py-0.5 text-[11px] hover:bg-muted">{s}</button>)}</div>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this contract…" className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <Button type="submit" size="icon" aria-label="Send"><Send className="size-4" /></Button>
        </form>
      </div>
    </div>
  );
}
