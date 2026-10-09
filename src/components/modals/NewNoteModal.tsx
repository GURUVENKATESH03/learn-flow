import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../../types';
import { X, Plus, Sparkles, Tag, Check, Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

interface NewNoteModalProps {
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Spring Boot', 'Backend']);
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  // Voice-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<'content' | 'title'>('content');

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);

        if (finalChunk) {
          if (activeField === 'title') {
            setTitle((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
          } else {
            setContent((prev) => {
              const separator = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
              return `${prev}${separator}${finalChunk.trim()}`;
            });
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Microphone permission was denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          // ignore silent pause
        } else {
          setMicError(`Voice input notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [activeField]);

  const toggleListening = async () => {
    setMicError(null);

    // If already listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      setInterimText('');
      return;
    }

    // Check if SpeechRecognition is supported
    if (!recognitionRef.current) {
      // Fallback for browsers without Web Speech API: request microphone to demonstrate permission and provide friendly demo transcription
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setIsListening(true);
          setInterimText('Simulating voice capture: "Kafka partitions and consumer groups"');
          setTimeout(() => {
            setContent((prev) =>
              prev
                ? `${prev}\n- Key takeaway: Kafka partitions ensure message ordering per partition.`
                : 'Key takeaway: Kafka partitions ensure message ordering per partition.'
            );
            setIsListening(false);
            setInterimText('');
          }, 2500);
          return;
        }
      } catch (err) {
        setMicError('Could not access microphone. Please check browser permissions.');
        return;
      }

      setMicError('Speech recognition is not supported in this browser. You can type directly.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err: any) {
      console.warn('Start recognition error:', err);
      // Restart if already running
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      } catch (e) {
        setMicError('Could not initialize microphone. Please try again.');
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAiAutoTag = () => {
    setIsAutoTagging(true);
    setTimeout(() => {
      const generated = ['Microservices', 'Distributed Systems', 'Architecture'];
      setTags((prev) => Array.from(new Set([...prev, ...generated])));
      setIsAutoTagging(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags,
      summary: content.slice(0, 100) + '...',
      color: 'teal',
      mindMapNodes: [
        { id: '1', label: title, type: 'root' },
        { id: '2', label: 'Core Principles', type: 'concept' },
        { id: '3', label: 'Implementation', type: 'practice' },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Smart Note</h3>
            <p className="text-xs text-slate-500">Capture code, patterns, or dictate via voice</p>
          </div>
          <button
            onClick={() => {
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (e) {}
              }
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Note Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Note Title
              </label>
              <button
                type="button"
                onClick={() => setActiveField('title')}
                className={`text-[10px] font-semibold transition ${
                  activeField === 'title'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {activeField === 'title' && isListening ? '● Dictating title' : 'Target title'}
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Consensus & Raft Protocol"
              value={title}
              onFocus={() => setActiveField('title')}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Voice to text status pill & controls */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition shadow-sm ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-900/50'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title={isListening ? 'Stop dictation' : 'Start voice dictation'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isListening ? 'Dictation Active' : 'Voice-to-Text'}
                  </span>
                  {isListening && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {isListening
                    ? `Dictating into ${activeField}...`
                    : 'Tap mic to dictate notes hands-free'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleListening}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                isListening
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isListening ? 'Stop Recording' : 'Start Dictation'}
            </button>
          </div>

          {/* Interim transcript feedback */}
          {isListening && interimText && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="italic">"{interimText}"</p>
            </div>
          )}

          {/* Error notice */}
          {micError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{micError}</span>
            </div>
          )}

          {/* Content / Code Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Content / Code Snippet
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveField('content')}
                  className={`text-[10px] font-semibold transition ${
                    activeField === 'content'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {activeField === 'content' && isListening ? '● Dictating here' : 'Target content'}
                </button>
                <button
                  type="button"
                  onClick={handleAiAutoTag}
                  disabled={isAutoTagging}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3 h-3" />
                  {isAutoTagging ? 'Analyzing...' : 'AI Auto-Tag'}
                </button>
              </div>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Write or dictate your note markdown or architecture thoughts..."
              value={content}
              onFocus={() => setActiveField('content')}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono ${
                isListening && activeField === 'content'
                  ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag (e.g. Security)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 flex items-center gap-1.5"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" /> Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
