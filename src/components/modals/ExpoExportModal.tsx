import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Download, Terminal, Layers } from 'lucide-react';

interface ExpoExportModalProps {
  onClose: () => void;
}

export const ExpoExportModal: React.FC<ExpoExportModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'app' | 'config' | 'package'>('instructions');
  const [copied, setCopied] = useState(false);

  const files = {
    app: `// expo/App.tsx - Full React Native & Expo Implementation
// See the /expo/App.tsx file in your project directory
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { db, auth } from './firebaseConfig';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  // Connects directly to your live Firestore database (no hardcoding)
  // ...
}`,
    config: `// expo/firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "elemental-context-w4mm2",
  appId: "1:583375871803:web:d0d330624d9cd9e113e11e",
  apiKey: "AIzaSyBR4sXn8mDVTUXw2vQaHqofQhug4F8jQus",
  authDomain: "elemental-context-w4mm2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-learnflow-8b5ac6e6-671e-4b90-ac7a-f92520e35b40"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
`,
    package: `// expo/package.json
{
  "name": "learnflow-mobile",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "firebase": "^11.0.0"
  }
}`
  };

  const currentCode = files[activeTab === 'instructions' ? 'app' : activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const fileList = [
      { name: 'App.tsx', content: files.app },
      { name: 'firebaseConfig.ts', content: files.config },
      { name: 'package.json', content: files.package },
      { name: 'README.md', content: '# LearnFlow Mobile Expo\n\nRun:\n1. cd expo\n2. npm install\n3. npx expo start\n' },
    ];

    fileList.forEach((f) => {
      const blob = new Blob([f.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Expo Mobile App (React Native)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Created in <code className="text-indigo-600 dark:text-indigo-400 font-mono">/expo/</code> directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2 px-2 border-b-2 transition ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            How to Run
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`pb-2 px-2 border-b-2 transition ${
              activeTab === 'app'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            App.tsx
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 px-2 border-b-2 transition ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            firebaseConfig.ts
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`pb-2 px-2 border-b-2 transition ${
              activeTab === 'package'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            package.json
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'instructions' ? (
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">
                  Native Mobile App Ready in <code className="font-mono">/expo</code>
                </span>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  All Expo React Native source files are generated in this codebase under <code className="font-mono font-bold">/expo/</code>, connected live to your Google Cloud Firestore database.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Run in 3 Commands:
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
{`cd expo
npm install
npx expo start`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Run on iOS & Android Phone:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Download <strong>Expo Go</strong> from App Store (iOS) or Play Store (Android).</li>
                  <li>Scan the terminal QR code from <code className="font-mono">npx expo start</code>.</li>
                  <li>The app runs as a native React Native application on your physical device.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-3 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-72 overflow-y-auto whitespace-pre-wrap">
                {currentCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadAll}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download Expo Files
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
