# Resume Manager

A React app for managing multiple tailored versions of your resume. Paste a job description and AI rewrites your resume to match it — powered by Groq's free API running `llama-3.3-70b-versatile`.

![Stack](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal) ![Express](https://img.shields.io/badge/Express-4-green)

---

## Features

- **Version management** — every AI generation creates a new version; the base resume is never overwritten
- **JD mode** — paste a full job description; the AI reorders bullets, rewrites the summary, and emphasizes the right skills
- **Prompt mode** — type a quick instruction ("make the summary shorter", "add GraphQL to backend skills")
- **PDF download** — browser-native print to PDF, pixel-perfect A4 output
- **Rename & delete** — double-click any version name to rename; trash icon to delete
- **Persistent** — all versions are saved in `localStorage`, survive page refreshes

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A free Groq API key — get one at [console.groq.com](https://console.groq.com/keys) (no credit card required)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API key
cp .env.example .env
# Open .env and paste your key: GROQ_API_KEY=gsk_...

# 3. Start both the React app and Express backend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The header shows a green **"Groq · llama-3.3-70b-versatile"** pill when everything is connected.

---

## How to use

| Step | Action |
|------|--------|
| 1 | App opens with your base resume pre-loaded in the center |
| 2 | Paste a job description in the right panel → click **Tailor to JD** |
| 3 | A new version appears in the left sidebar, tailored to that JD |
| 4 | Select any version → use **Quick Edit** for small targeted changes |
| 5 | Double-click a version name to rename it |
| 6 | Click **Download PDF** to print the currently viewed version |

---

## Project Structure

```
├── server/
│   └── index.js             # Express backend — holds Groq API key, calls Groq
├── src/
│   ├── data/
│   │   └── baseResume.js    # Resume JSON + version factory
│   ├── services/
│   │   └── resumeService.js # Calls /api/* on the Express backend
│   ├── hooks/
│   │   └── useVersions.js   # All version state + AI orchestration
│   └── components/
│       ├── ResumePreview.jsx    # Renders JSON → A4 resume + PDF target
│       ├── ResumePreview.css    # Resume styles (scoped, print-safe)
│       ├── VersionPanel.jsx     # Left sidebar: version list
│       └── InputPanel.jsx       # Right sidebar: JD / prompt input
```

---

## Architecture

```
Browser (React)  →  /api/*  →  Vite proxy  →  Express :3001  →  Groq API
```

The Groq API key lives only in `.env` on the Express backend. The browser never sees it — Vite proxies all `/api` requests to the backend during development.

---

## Available scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Starts both Vite (frontend) and Express (backend) together |
| `npm run dev:client` | Starts only the Vite dev server |
| `npm run dev:server` | Starts only the Express backend |
| `npm run build` | Builds React to `dist/` for production |

---

## Updating your resume content

Edit [`src/data/baseResume.js`](src/data/baseResume.js) — the `baseResumeData` object holds all your resume content as plain JavaScript. Change any field and the base version updates immediately (clear localStorage first if needed: DevTools → Application → Local Storage → Clear).

---

## Tech choices

**Why an Express backend?**
The Groq API key must never be in frontend code — anyone can read it from the browser's network tab. The Express backend is a thin secure proxy: it holds the key, receives requests from React, calls Groq, and returns results.

**Why Groq instead of a local model?**
Local models small enough to run on a MacBook Air (3B parameters) produce inconsistent JSON output and generic edits. `llama-3.3-70b-versatile` on Groq is a 70B model with proper instruction following. Groq's free tier (14,400 requests/day) is more than enough for personal resume use.

**Why localStorage, not a database?**
Resume data is text-only and small. localStorage handles it without a server, a schema, or a migration story. If versions ever grow large, swap `useVersions.js` to use IndexedDB — the hook interface stays the same.

**Why `window.print()` for PDF?**
Browser print gives pixel-perfect A4 output that matches what you see on screen. Libraries like `html2pdf` or `jsPDF` re-render the DOM and often break fonts and layout. The `@media print` CSS uses `visibility: hidden` on everything except the resume card, so only the resume appears on the printed page.

**Why `response_format: { type: "json_object" }` in Groq?**
Grammar-enforced JSON output means the model literally cannot return invalid JSON. Without it, models sometimes wrap output in markdown code fences or add explanatory text, which breaks `JSON.parse()`.
