import React, { useState } from 'react';
import {
  Wifi,
  Battery,
  Smartphone,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onQuickQuizTrigger?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  theme,
  onToggleTheme,
  onQuickQuizTrigger,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Current formatted time (e.g., 9:41)
  const currentTime = '9:41';
  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentAppUrl
  )}`;

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 transition-colors duration-300 ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-800'
      }`}
    >
      {/* Outer Studio Controller Header (visible in desktop view) */}
      {!isFullscreen && (
        <div className="w-full max-w-xl mx-auto mb-3 hidden sm:flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-tight text-white">LearnFlow Mobile Simulator</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 font-mono">iPhone 16 Pro</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Open on Phone button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-xs"
              title="Open or Scan on Real Phone"
            >
              <QrCode className="w-3.5 h-3.5" /> Open on Phone
            </button>

            {/* Quick Trigger button */}
            {onQuickQuizTrigger && (
              <button
                onClick={onQuickQuizTrigger}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 transition"
                title="Trigger Quick Smart Quiz"
              >
                <Sparkles className="w-3 h-3" /> Quick Quiz
              </button>
            )}

            {/* Scale Selector */}
            <div className="flex items-center bg-slate-700 rounded-lg p-0.5 text-[11px]">
              <button
                onClick={() => setScale(0.85)}
                className={`px-1.5 py-0.5 rounded ${scale === 0.85 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'}`}
              >
                85%
              </button>
              <button
                onClick={() => setScale(1)}
                className={`px-1.5 py-0.5 rounded ${scale === 1 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'}`}
              >
                100%
              </button>
            </div>

            {/* Dark/Light Mode toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px] font-semibold"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 transition"
              title="Fullscreen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Minimize Button when in Fullscreen */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-3 right-3 z-50 p-2 rounded-xl bg-slate-800/80 text-white backdrop-blur-md border border-slate-700 shadow-lg hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Exit Fullscreen"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Frame</span>
        </button>
      )}

      {/* QR Code / Mobile Export Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-left">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Open on Your Phone
                  </h3>
                  <p className="text-[11px] text-slate-400">Scan or copy the link</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Image */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 inline-block shadow-sm">
              <img
                src={qrCodeUrl}
                alt="Scan with phone"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="space-y-2 text-left text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  1
                </span>
                <span className="text-[11px]">Scan QR code with your phone camera or browser.</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  2
                </span>
                <span className="text-[11px]">
                  In Safari or Chrome, tap <strong>Share → Add to Home Screen</strong> to install like a native app.
                </span>
              </div>
            </div>

            {/* Copy Link Button */}
            <div className="pt-1 flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copied Link!' : 'Copy Mobile URL'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Wrapper */}
      <div
        style={{
          transform: !isFullscreen && scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className={`w-full transition-transform duration-200 ${
          isFullscreen
            ? 'max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 shadow-none'
            : 'max-w-[400px] h-[844px] rounded-[52px] bg-slate-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1e293b,0_0_0_14px_#334155] border-4 border-slate-800 relative'
        }`}
      >
        {/* Phone Inner Display Container */}
        <div
          className={`w-full h-full bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col relative transition-colors duration-200 ${
            theme === 'dark' ? 'dark' : ''
          } ${isFullscreen ? 'rounded-none' : 'rounded-[42px]'}`}
        >
          {/* iOS Top Status Bar */}
          <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-slate-900 dark:text-white shrink-0 select-none z-30">
            {/* Clock */}
            <span className="text-xs font-bold tracking-tight">{currentTime}</span>

            {/* Dynamic Island Pill */}
            <div className="w-24 h-6 rounded-full bg-black flex items-center justify-between px-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Right Status Icons: Signal, Wifi, Battery */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-1 bg-current rounded-xs" />
                <span className="w-0.5 h-1.5 bg-current rounded-xs" />
                <span className="w-0.5 h-2 bg-current rounded-xs" />
                <span className="w-0.5 h-2.5 bg-current rounded-xs" />
              </div>
              <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
              <Battery className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          {/* App Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto no-scrollbar relative">
            {children}
          </main>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/40 dark:bg-slate-100/40 rounded-full pointer-events-none z-50" />
        </div>
      </div>
    </div>
  );
};
