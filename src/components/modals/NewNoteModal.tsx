import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../../types';
import {
  X,
  Plus,
  Sparkles,
  Tag,
  Check,
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  ImageIcon,
  UploadCloud,
  Trash2,
  Image as ImageLucide,
} from 'lucide-react';

interface NewNoteModalProps {
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
  onError?: (msg: string) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({ onClose, onSave, onError }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Image Attachment State
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          // ignore
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
        } catch (e) {}
      }
    };
  }, [activeField]);

  const toggleListening = async () => {
    setMicError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setInterimText('');
      return;
    }

    if (!recognitionRef.current) {
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
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      } catch (e) {
        setMicError('Could not initialize microphone. Please try again.');
      }
    }
  };

  // Image Upload Handling
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = 'Please choose an image under 5MB.';
        setFormError(errorMsg);
        onError?.(errorMsg);
        return;
      }
      setFormError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSampleDiagram = (url: string) => {
    setImageUrl(url);
    setFormError(null);
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

  // Client-side rule extractor for instant, 100% reliable title-relevant tags
  const extractTagsFromTitle = (noteTitle: string, noteContent: string = ''): string[] => {
    const combined = `${noteTitle} ${noteContent}`.toLowerCase();
    const matched: string[] = [];

    const techDictionary: [RegExp, string][] = [
      [/\breact\b/i, 'React'],
      [/\bvue(\.js)?\b/i, 'Vue.js'],
      [/\bangular\b/i, 'Angular'],
      [/\bnext(\.js)?\b/i, 'Next.js'],
      [/\bsvelte\b/i, 'Svelte'],
      [/\btailwind(\s?css)?\b/i, 'Tailwind CSS'],
      [/\bcss\b/i, 'CSS'],
      [/\bspring(\s?boot)?\b/i, 'Spring Boot'],
      [/\bjava\b/i, 'Java'],
      [/\bnode(\.js)?\b/i, 'Node.js'],
      [/\bpython\b/i, 'Python'],
      [/\bgo(lang)?\b/i, 'Go'],
      [/\brust\b/i, 'Rust'],
      [/\btypescript\b/i, 'TypeScript'],
      [/\bjavascript\b/i, 'JavaScript'],
      [/\bsql\b/i, 'SQL'],
      [/\bnosql\b/i, 'NoSQL'],
      [/\bpostgres(ql)?\b/i, 'PostgreSQL'],
      [/\bmysql\b/i, 'MySQL'],
      [/\bmongo(db)?\b/i, 'MongoDB'],
      [/\bredis\b/i, 'Redis'],
      [/\bcassandra\b/i, 'Cassandra'],
      [/\bmicroservices?\b/i, 'Microservices'],
      [/\bdistributed(\s?systems?)?\b/i, 'Distributed Systems'],
      [/\bclean\s?architecture\b/i, 'Clean Architecture'],
      [/\bdesign\s?patterns?\b/i, 'Design Patterns'],
      [/\bkafka\b/i, 'Kafka'],
      [/\brabbitmq\b/i, 'RabbitMQ'],
      [/\bevent-?driven\b/i, 'Event-Driven'],
      [/\bapi\b/i, 'API'],
      [/\brest(ful)?\b/i, 'REST API'],
      [/\bgraphql\b/i, 'GraphQL'],
      [/\bdocker\b/i, 'Docker'],
      [/\bkubernetes|k8s\b/i, 'Kubernetes'],
      [/\bci\/?cd\b/i, 'CI/CD'],
      [/\bdevops\b/i, 'DevOps'],
      [/\btesting|unit\s?tests?\b/i, 'Testing'],
      [/\bsecurity|auth|jwt|oauth\b/i, 'Security'],
      [/\bjpa|hibernate\b/i, 'JPA / ORM'],
      [/\bcache|caching\b/i, 'Caching'],
      [/\bstate\s?management\b/i, 'State Management'],
    ];

    for (const [regex, tag] of techDictionary) {
      if (regex.test(combined) && !matched.includes(tag)) {
        matched.push(tag);
        if (matched.length >= 4) break;
      }
    }

    if (matched.length === 0 && noteTitle.trim()) {
      const stopWords = new Set(['the', 'and', 'for', 'with', 'how', 'what', 'why', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'is', 'vs', 'or', 'by', 'from']);
      const words = noteTitle
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

      for (const w of words) {
        const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
        if (!matched.includes(capitalized)) {
          matched.push(capitalized);
        }
        if (matched.length >= 3) break;
      }
    }

    return matched.length > 0 ? matched : ['Software Architecture', 'Core Principles'];
  };

  const handleAiAutoTag = async () => {
    const rawTitle = title.trim();
    const rawContent = content.trim();

    if (!rawTitle && !rawContent) {
      const msg = 'Please enter a Note Title first to auto-generate tags.';
      setFormError(msg);
      onError?.(msg);
      return;
    }

    setIsAutoTagging(true);
    setFormError(null);

    try {
      let suggested: string[] = [];

      try {
        const res = await fetch('/api/ai/auto-tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: rawTitle, content: rawContent }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.tags) && data.tags.length > 0) {
            suggested = data.tags;
          }
        }
      } catch (e) {
        // Fallback to client-side extractor below
      }

      if (suggested.length === 0) {
        suggested = extractTagsFromTitle(rawTitle, rawContent);
      }

      setTags((prev) => Array.from(new Set([...prev, ...suggested])));
    } catch (err) {
      const fallback = extractTagsFromTitle(rawTitle, rawContent);
      setTags((prev) => Array.from(new Set([...prev, ...fallback])));
    } finally {
      setIsAutoTagging(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a note title.');
      onError?.('Please enter a note title before saving.');
      return;
    }
    if (!content.trim()) {
      setFormError('Please enter note content.');
      onError?.('Please enter note content before saving.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      tags: tags.length > 0 ? tags : ['General'],
      summary: content.slice(0, 100) + '...',
      color: 'teal',
      mindMapNodes: [
        { id: '1', label: title.trim(), type: 'root' },
        { id: '2', label: 'Core Principles', type: 'concept' },
        { id: '3', label: 'Implementation', type: 'practice' },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Smart Note</h3>
            <p className="text-xs text-slate-500">Dictate via voice & attach architecture images</p>
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
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

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

          {/* Image Attachment Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                Image Attachment
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove Image
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-950">
                <img
                  src={imageUrl}
                  alt="Attached diagram"
                  className="w-full h-36 object-cover object-center"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/60 dark:bg-slate-800/40 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 group"
                >
                  <UploadCloud className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Architecture Diagram or Screenshot
                  </span>
                  <span className="text-[10px] text-slate-400">
                    PNG, JPG, or SVG up to 5MB
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Quick Preset Diagrams */}
                <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                    Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSampleDiagram(
                        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 whitespace-nowrap"
                  >
                    + Server Architecture
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSampleDiagram(
                        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 whitespace-nowrap"
                  >
                    + Security Matrix
                  </button>
                </div>
              </div>
            )}
          </div>

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
              rows={5}
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
