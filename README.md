# Resume Manager

A local-first React app for managing multiple tailored versions of your resume. Paste a job description and a local AI rewrites your resume to match it — no cloud, no API keys, everything stays on your machine.

![Stack](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Ollama](https://img.shields.io/badge/Ollama-local_AI-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal)

---

## Features

- **Version management** — every AI generation creates a new version; the base resume is never overwritten
- **JD mode** — paste a full job description; the AI reorders bullets, rewrites the summary, and emphasizes the right skills
- **Prompt mode** — type a quick instruction ("make the summary shorter", "add GraphQL to backend skills")
- **PDF download** — browser-native print to PDF, pixel-perfect A4 output
- **Rename & delete** — double-click any version name to rename; trash icon to delete
- **Persistent** — all versions are saved in `localStorage`, survive page refreshes
- **100% local** — uses Ollama running on your Mac; nothing leaves your machine

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.com/) installed and running

Pull the model used by the app:

```bash
ollama pull qwen2.5:3b
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start Ollama (if not already running)
ollama serve

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
src/
├── data/
│   └── baseResume.js        # Resume JSON + version factory
├── services/
│   └── ollamaService.js     # Ollama REST API integration
├── hooks/
│   └── useVersions.js       # All version state + AI orchestration
└── components/
    ├── ResumePreview.jsx    # Renders JSON → A4 resume + PDF target
    ├── ResumePreview.css    # Resume styles (scoped, print-safe)
    ├── VersionPanel.jsx     # Left sidebar: version list
    └── InputPanel.jsx       # Right sidebar: JD / prompt input
```

---

## Changing the AI model

The model is set in [`src/services/ollamaService.js`](src/services/ollamaService.js):

```js
const MODEL = 'qwen2.5:3b'
```

Other lightweight options for Apple Silicon:

| Model | Size | Notes |
|-------|------|-------|
| `qwen2.5:3b` | 1.9 GB | Best structured JSON output — default |
| `llama3.2:3b` | 2.0 GB | Strong instruction following |
| `llama3.2:1b` | 1.3 GB | Fastest, slightly less accurate |
| `phi3.5:mini` | 2.2 GB | Good at concise rewrites |

---

## Updating your resume content

Edit [`src/data/baseResume.js`](src/data/baseResume.js) — the `baseResumeData` object holds all your resume content as plain JavaScript. Change any field and the base version updates immediately (clear localStorage first if needed: DevTools → Application → Local Storage → Clear).

---

## Tech choices

**Why localStorage, not a database?**
Resume data is text-only and small. localStorage handles it without a server, a schema, or a migration story. If versions ever grow large, swap `useVersions.js` to use IndexedDB — the hook interface stays the same.

**Why `window.print()` for PDF?**
Browser print gives pixel-perfect A4 output that matches what you see on screen. Libraries like `html2pdf` or `jsPDF` re-render the DOM and often break fonts and layout. The `@media print` CSS hides everything except the resume.

**Why `format: "json"` in Ollama?**
Ollama's grammar enforcement guarantees the model outputs valid JSON, so the app never crashes on a parse error. Without it, local models often wrap output in markdown code fences.
