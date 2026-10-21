import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Note } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
  Code2,
} from 'lucide-react';

interface AIScreenProps {
  notes: Note[];
  onStartQuiz: (topic: string, content: string) => void;
  onSaveAsNote: (title: string, content: string) => void;
}

export const AIScreen: React.FC<AIScreenProps> = ({ notes, onStartQuiz, onSaveAsNote }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Hello! 👋 I am your LearnFlow AI companion powered by Gemini 3.8 Flash. Ask me any technical question, request architecture breakdowns, or practice technical quizzes.",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionPrompts = [
    'Explain Clean Architecture principles',
    'Compare SQL vs NoSQL databases',
    'Explain async event-driven systems',
    'Generate a quick technical quiz',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    if (text === 'Generate a quick technical quiz') {
      if (notes.length > 0) {
        const topNote = notes[0];
        onStartQuiz(topNote.title, topNote.content);
      } else {
        onStartQuiz('Software Engineering Fundamentals', 'Clean code, data structures, and architecture principles.');
      }
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: `User Guru is studying Spring Boot, Kafka, and Vue.js. Existing note topics: ${notes.map((n) => n.title).join(', ')}.`,
        }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Great question! Let me know if you would like code examples or a quick quiz on this.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Regarding "${text}": When building distributed systems, ensure separation of concerns, stateless authentication tokens, and idempotent event consumers.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: 'ai',
        text: "New chat session started! What technical concept or project milestone shall we tackle?",
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] px-4 pt-2 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white">AI Explorer</h1>
            <p className="text-[11px] text-slate-400">Ask about notes, projects, or concepts</p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> New Chat
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="py-2.5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {suggestionPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-semibold whitespace-nowrap border border-indigo-100 dark:border-indigo-900/60 transition"
          >
            ✦ {p}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                  : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-xs shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* AI action bar */}
              {msg.sender === 'ai' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-indigo-600 flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => onSaveAsNote('AI Note: ' + msg.text.slice(0, 30), msg.text)}
                      className="hover:text-indigo-600 flex items-center gap-1 transition"
                    >
                      <BookOpen className="w-3 h-3" /> Save to Notes
                    </button>
                  </div>
                  <span>{msg.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 max-w-[70%]">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-xs text-slate-500">Gemini is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="pt-2 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask about Kafka, Spring Boot, or tests..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
