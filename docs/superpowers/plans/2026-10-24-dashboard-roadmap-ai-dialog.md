# Dashboard, Roadmap, AI, and Dialog Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the redundant mobile top tab strip and gesture navigation, ensure a newly generated roadmap is the active zero-progress roadmap, correct the diffusion-model fallback, and use an app-rendered delete dialog instead of browser confirms.

**Architecture:** Keep the existing React/Vite web application and its bottom navigation. Remove gesture/keyboard tab-switch handlers from the application shell. Normalize and prioritize the newly saved roadmap, make AI fallbacks technically relevant or transparent, and route delete confirmation through the shared React dialog component. The Vercel web app cannot invoke an Android/iOS OS-native alert; its dialog will be built inside the app.

**Tech Stack:** React 19, TypeScript, Vite, Firebase Firestore, Tailwind CSS; verification through the existing TypeScript lint and Vite build scripts.

## Global Constraints

- Preserve the existing desktop navigation and mobile bottom navigation.
- Do not use browser `confirm()` for delete confirmation.
- A newly created roadmap must start with `overallProgress: 0` and milestone `progress: 0`.
- Do not fabricate an unrelated AI answer when AI generation fails.
- Do not modify unrelated local work.

---

### Task 1: Restore simple mobile tab navigation

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Keep `TabType` and the existing `Navigation` component as the mobile tab switcher.
- Remove touch and arrow-key handlers that switch tabs.

- [x] Remove the mobile top segmented tab strip and swipe-feedback overlay.
- [x] Remove touch-state refs, touch handlers, keyboard arrow navigation, and related icon imports.
- [x] Keep desktop header tabs, mobile bottom tabs, and ordinary vertical page scrolling.
- [x] Run `npm run lint` and `npm run build`.

### Task 2: Keep the newly generated roadmap active at 0%

**Files:**
- Modify: `src/components/screens/RoadmapScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/types/index.ts`

**Interfaces:**
- `Roadmap` may carry an optional numeric `updatedAt` timestamp for selecting the newest active Firestore record.
- Roadmap generation continues to call `onUpdateRoadmap(roadmap)` with all progress values normalized to zero.

- [x] Preserve zero progress in the generation payload and use the current roadmap ID when replacing it, so regeneration overwrites rather than races with an older active record.
- [x] Stamp roadmap saves with `updatedAt` and choose the newest record in the Firestore subscription; old records without timestamps remain readable.
- [x] Run `npm run lint` and `npm run build`.

### Task 3: Correct AI behavior when Gemini is unavailable

**Files:**
- Modify: `server.ts`
- Modify: `src/components/screens/AIScreen.tsx`

**Interfaces:**
- `/api/ai/chat` continues returning `{ reply, model }` on success and fallback paths.
- The client fallback gives a focused diffusion-model explanation for that topic and otherwise reports AI unavailability instead of fabricating an unrelated answer.

- [x] Add an accurate diffusion-model fallback explaining the forward-noising and reverse-denoising process, conditioning, and common variants.
- [x] Replace the catch-all distributed-systems answer with a relevant unavailable response.
- [x] Replace the client hard-coded unrelated answer with a focused diffusion explanation or a clear AI service/network error response.
- [x] Run `npm run lint` and `npm run build`.

### Task 4: Use the app-rendered confirmation dialog consistently

**Files:**
- Modify: `src/components/modals/NoteDetailModal.tsx`
- Modify: `src/components/modals/ConfirmModal.tsx`

**Interfaces:**
- Reuse `ConfirmModal` for note deletion and retain its existing props and behavior for Roadmap and Projects.

- [x] Replace the remaining note-detail `confirm()` call with `ConfirmModal` state and callbacks.
- [x] Improve dialog labeling and focus behavior without using a browser-generated popup.
- [x] Search the web app for remaining `confirm()` calls and run `npm run lint` and `npm run build`.
