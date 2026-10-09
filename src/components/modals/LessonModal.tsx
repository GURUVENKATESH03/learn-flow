import React, { useState } from 'react';
import { X, CheckCircle2, Circle, ArrowRight, Play, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonModalProps {
  onClose: () => void;
  onCompleteLesson: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ onClose, onCompleteLesson }) => {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);

  const steps = [
    {
      title: '1. JWT Filter Setup',
      desc: 'Extend OncePerRequestFilter to intercept incoming HTTP requests and inspect the Authorization header.',
      code: `@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  // Intercept once per request
}`,
    },
    {
      title: '2. Token Validation & Parsing',
      desc: 'Parse the signature using secret HMAC key and extract the subject username from claims.',
      code: `String jwt = authHeader.substring(7);
String username = jwtService.extractUsername(jwt);`,
    },
    {
      title: '3. SecurityContext Injection',
      desc: 'Set the authenticated Principal into SecurityContextHolder for Spring Security permission checks.',
      code: `SecurityContextHolder.getContext().setAuthentication(
    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
);`,
    },
    {
      title: '4. Testing & Verification',
      desc: 'Send test request with valid Bearer token and verify HTTP 200 OK without session cookies.',
      code: `curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/v1/profile`,
    },
  ];

  const handleStepComplete = (idx: number) => {
    if (!completedSteps.includes(idx)) {
      setCompletedSteps((prev) => [...prev, idx]);
    }
    if (idx < steps.length - 1) {
      setStep(idx + 1);
    } else {
      confetti({ particleCount: 70, spread: 50 });
      onCompleteLesson();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                Spring Boot Security
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">JWT Authentication Flow</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Step {step + 1} of {steps.length}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round((completedSteps.length / steps.length) * 100)}% Mastered
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {steps[step].title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {steps[step].desc}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner">
            <pre>{steps[step].code}</pre>
          </div>

          {/* Stepper overview */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Checkpoint Checklist
            </span>
            <div className="space-y-1.5">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition ${
                    step === idx
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {completedSteps.includes(idx) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <span className="truncate">{s.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button
            onClick={() => handleStepComplete(step)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
          >
            {step < steps.length - 1 ? (
              <>
                Complete & Continue <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Finish Lesson & Mark Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
