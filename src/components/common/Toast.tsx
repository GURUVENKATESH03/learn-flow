import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration || 3500;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)] animate-in slide-in-from-top-4 duration-300"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
          isSuccess
            ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/30 text-slate-800 dark:text-slate-100 shadow-emerald-500/10'
            : isError
            ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/30 text-slate-800 dark:text-slate-100 shadow-rose-500/10'
            : 'bg-white/95 dark:bg-slate-900/95 border-indigo-500/30 text-slate-800 dark:text-slate-100 shadow-indigo-500/10'
        }`}
      >
        <div
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
            isSuccess
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
              : isError
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
              : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          {isSuccess && <CheckCircle2 className="w-5 h-5" />}
          {isError && <AlertCircle className="w-5 h-5" />}
          {!isSuccess && !isError && <Sparkles className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <h4
              className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${
                isSuccess
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isError
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {toast.title}
            </h4>
          )}
          <p className="text-xs sm:text-sm font-medium leading-snug break-words text-slate-700 dark:text-slate-200">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
