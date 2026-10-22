import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Globe,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { signInWithGoogle } from '../../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'current domain';

  // Instant Guest / Demo Login
  const handleGuestLogin = () => {
    const guestProfile: UserProfile = {
      name: 'Prakash (Developer)',
      email: 'prakashgvp.dev03@gmail.com',
      role: 'Full Stack Software Engineer',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      streak: 0,
      totalNotes: 0,
      totalProjects: 0,
      weeklyGoals: { completed: 0, total: 0 },
      isGoogleConnected: false,
      githubConnected: false,
    };
    onLoginSuccess(guestProfile);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);

    try {
      const profile = await signInWithGoogle();
      if (profile) {
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err?.message || String(err);
      if (msg.includes('auth/unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setErrorMessage(
          `Domain "${currentDomain}" is not yet in Firebase Auth's Authorized Domains list.`
        );
      } else {
        setErrorMessage(msg || 'Google Sign-in was cancelled or encountered an issue. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Hero & Key Capabilities */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI-Powered Developer Learning & Git Hub</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-6 h-6 stroke-[2.4]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Learn<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
              Your comprehensive developer companion. Track GitHub repositories, review live commits and open PRs, build interactive concept mind-maps, and generate dynamic AI roadmaps.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cloud Firestore Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time persistence for your notes, tasks, milestones, and Git tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GitHub Live Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect your GitHub to sync repositories, recent commits, and pull requests.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gemini 3.8 Flash AI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generate personalized curriculum roadmaps, note summaries, and interactive quizzes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Mind-Mapping</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualize knowledge connections and explore technical concepts dynamically.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication & Instant Access Box */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome to LearnFlow
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Access your personalized workspace on desktop or mobile.
              </p>
            </div>

            {/* Unauthorized Domain Diagnostic Banner */}
            {isUnauthorizedDomain && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm">Firebase Domain Authorization Required</span>
                    <p className="mt-1 leading-relaxed">
                      Google OAuth blocks sign-ins until your Vercel domain <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-amber-950 dark:text-amber-100">{currentDomain}</code> is added to your Firebase project.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Continue in Instant Access Mode (No Setup Needed)
                  </button>

                  <a
                    href="https://console.firebase.google.com/project/elemental-context-w4mm2/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-amber-300 dark:border-amber-800/80 transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>Open Firebase Console to Authorize Domain</span>
                  </a>
                </div>
              </div>
            )}

            {/* General Error Banner */}
            {errorMessage && !isUnauthorizedDomain && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Primary Instant Access Button */}
              <button
                onClick={handleGuestLogin}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Continue to LearnFlow (Instant Access)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800" />
                <span className="shrink mx-3 text-slate-400 text-xs uppercase font-medium">Or</span>
                <div className="grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              {/* Google Single Sign-On Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>Sign in with Google (Firebase)</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center space-y-1">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Responsive on both desktop laptops and mobile web browsers.
              </p>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                <span>Zero telemetry · All data secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
