import React, { useState } from 'react';
import { BookOpen, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Lock, Cpu, Globe, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { signInWithGoogle } from '../../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.message || 'Google Sign-in was cancelled or encountered an issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Flutter Mobile App Top Brand Bar */}
      <div className="pt-6 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 ring-8 ring-indigo-50 dark:ring-indigo-950/40">
          <BookOpen className="w-8 h-8 stroke-[2.4]" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Learn<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Mobile Native Learning & Project Hub
          </p>
        </div>
      </div>

      {/* Middle Feature Highlights */}
      <div className="my-6 space-y-3">
        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-950/80 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Firebase Cloud Firestore Sync
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Zero hardcoding. All notes, roadmaps, and git projects persist in real-time Firestore.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              GitHub Repositories Live Sync
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Filter public or private repos with real commit histories and task boards.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Gemini 3.8 Flash AI Engine
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive mind map nodes, dynamic roadmaps, voice dictation, and smart quizzes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Auth Card: Single Option Sign-In using Google */}
      <div className="space-y-3 pb-4">
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Single Sign-On (Firebase Auth)</span>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 group active:scale-98 disabled:opacity-75 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-indigo-600 dark:text-indigo-400">Authenticating with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G SVG logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
            Signing in connects your Firebase Firestore cloud database & unlocks Gemini AI roadmapping.
          </p>
        </div>

        <p className="text-[10px] text-center text-slate-400 dark:text-slate-600">
          LearnFlow Flutter Mobile • Powered by Google Firebase & Gemini
        </p>
      </div>
    </div>
  );
};
