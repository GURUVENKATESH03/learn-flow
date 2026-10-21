# LearnFlow Mobile (Expo / React Native)

A cross-platform mobile application built with **Expo SDK 52 & React Native**, synchronized live with your **Google Cloud Firestore** database.

## Database & Authentication
- **Firestore DB ID**: `ai-studio-learnflow-8b5ac6e6-671e-4b90-ac7a-f92520e35b40`
- **Project ID**: `elemental-context-w4mm2`
- Synchronized live in real-time with your database collections (`notes`, `tasks`, `projects`).

---

## Quick Fix for Local Run (`expo-asset` error)

Run this single command in your terminal (`D:\learnflow\expo`):

```bash
npx expo install expo-asset
```

Or install all project dependencies cleanly:

```bash
npm install
```

---

## How to Start & Run on Your Mobile Phone

1. **Start the Expo server**:
   ```bash
   npx expo start -c
   ```
   *(The `-c` flag clears Metro cache to ensure smooth startup)*

2. **Open on your phone**:
   - **Android**: Install the **Expo Go** app from Google Play Store, then scan the QR code displayed in your terminal.
   - **iPhone (iOS)**: Install **Expo Go** from the App Store, then open your iPhone Camera and scan the QR code in your terminal.
   - **Web preview**: Press `w` in your terminal to view the mobile app in your desktop browser.
