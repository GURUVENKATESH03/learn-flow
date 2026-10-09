import React, { useState } from 'react';
import { Quiz, QuizQuestion } from '../../types';
import { X, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onFinish?: (score: number, total: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion: QuizQuestion = quiz.questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (onFinish) {
        onFinish(score + (selectedOption === currentQuestion.correctIndex ? 1 : 0), quiz.questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Quiz: {quiz.topic}</h3>
              <p className="text-xs text-slate-500">
                {!isCompleted ? `Question ${currentIndex + 1} of ${quiz.questions.length}` : 'Quiz Results'}
              </p>
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
        {!isCompleted && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
            <div
              className="bg-indigo-600 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {!isCompleted ? (
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-4">
                {currentQuestion.question}
              </h4>

              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  let buttonStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';
                  
                  if (selectedOption === idx) {
                    buttonStyle = 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30';
                  }

                  if (isAnswerSubmitted) {
                    if (idx === currentQuestion.correctIndex) {
                      buttonStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/40';
                    } else if (selectedOption === idx && idx !== currentQuestion.correctIndex) {
                      buttonStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/40';
                    } else {
                      buttonStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && selectedOption === idx && idx !== currentQuestion.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {isAnswerSubmitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    Explanation
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-8 ring-indigo-50 dark:ring-indigo-950/40">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Quiz Completed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  You scored <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{score}</span> out of {quiz.questions.length} questions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 max-w-xs mx-auto text-xs text-slate-600 dark:text-slate-300">
                {score === quiz.questions.length
                  ? '🎯 Outstanding! You have mastered this concept completely.'
                  : score >= quiz.questions.length / 2
                  ? '👍 Good job! Review the explanations to reinforce key points.'
                  : '💡 Keep reviewing your notes and retry to build retention.'}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!isCompleted && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50 hover:bg-indigo-700 transition"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
              >
                {currentIndex + 1 < quiz.questions.length ? 'Next Question' : 'View Results'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
