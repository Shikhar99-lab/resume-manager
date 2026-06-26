/**
 * InputPanel — Right sidebar
 *
 * Two modes:
 *   "jd"     — paste a full job description, AI tailors the resume to it
 *   "prompt" — type a short instruction, AI makes that specific change
 *
 * Shows generation status, errors, and the source content of the current version.
 *
 * REACT CONCEPTS:
 * - useState for local UI state (textarea value, selected mode)
 * - Props for communication: callbacks passed down from App.jsx
 * - Controlled components: textarea value tied to React state
 */

import { useState, useEffect } from 'react'

export default function InputPanel({
  activeVersion,
  isGenerating,
  generationStatus,
  generationError,
  onGenerate,
  onClearError,
}) {
  const [mode, setMode] = useState('jd')
  const [input, setInput] = useState('')

  // When the user selects a different version, show what was used to generate it
  useEffect(() => {
    if (activeVersion?.sourceContent && activeVersion?.source !== 'base') {
      setInput(activeVersion.sourceContent)
      setMode(activeVersion.source)
    } else {
      setInput('')
    }
  }, [activeVersion?.id])

  function handleGenerate() {
    if (!input.trim()) return
    onClearError()
    onGenerate(input.trim(), mode)
  }

  const placeholder =
    mode === 'jd'
      ? `Paste the full job description here…\n\nExample:\n"We are looking for a Senior React Developer with 4+ years of experience in TypeScript, Next.js, and REST APIs. Experience with AWS and CI/CD pipelines is a plus…"`
      : `Describe what to change…\n\nExamples:\n• "Make the summary more concise, under 3 sentences"\n• "Move Docker and Kubernetes to the top of Cloud skills"\n• "Add 'GraphQL' to backend skills"\n• "Rewrite the SunTec bullets to sound more senior"`

  return (
    <div id="input-panel" className="flex flex-col h-full bg-gray-950 text-gray-300 w-80 shrink-0 border-l border-gray-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          AI Resume Editor
        </h2>

        {/* Mode toggle */}
        <div className="flex rounded overflow-hidden border border-gray-700 text-xs">
          <button
            onClick={() => setMode('jd')}
            className={`flex-1 py-1.5 font-medium transition-colors ${
              mode === 'jd'
                ? 'bg-blue-700 text-white'
                : 'bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
          >
            Job Description
          </button>
          <button
            onClick={() => setMode('prompt')}
            className={`flex-1 py-1.5 font-medium transition-colors ${
              mode === 'prompt'
                ? 'bg-purple-700 text-white'
                : 'bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
          >
            Quick Edit
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col px-4 py-3 min-h-0">
        <label className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">
          {mode === 'jd' ? 'Paste Job Description' : 'Describe Your Edit'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isGenerating}
          className="flex-1 resize-none bg-gray-900 border border-gray-700 rounded text-xs text-gray-200 p-3 placeholder-gray-700 focus:outline-none focus:border-blue-600 disabled:opacity-50 leading-relaxed"
        />
        <p className="text-[10px] text-gray-700 mt-1.5 text-right">
          {input.length} chars
        </p>
      </div>

      {/* Status / Error */}
      <div className="px-4">
        {generationError && (
          <div className="mb-3 p-3 rounded bg-red-950 border border-red-800 text-xs text-red-300">
            <div className="font-semibold mb-1">Error</div>
            <div className="text-red-400 leading-relaxed">{generationError}</div>
            <button
              onClick={onClearError}
              className="mt-2 text-[10px] text-red-500 hover:text-red-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="mb-3 p-3 rounded bg-blue-950 border border-blue-800 text-xs text-blue-300 flex items-center gap-2">
            <Spinner />
            <span>{generationStatus || 'Thinking…'}</span>
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !input.trim()}
          className={`w-full py-2.5 rounded text-sm font-semibold tracking-wide transition-all ${
            mode === 'jd'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isGenerating
            ? 'Generating…'
            : mode === 'jd'
            ? 'Tailor to JD →'
            : 'Apply Edit →'}
        </button>

        <p className="text-[10px] text-gray-700 text-center mt-2">
          Uses <span className="text-gray-500">llama-3.3-70b</span> via Groq — free
          tier, fast cloud inference
        </p>
      </div>

      {/* How it works section */}
      <div className="border-t border-gray-800 px-4 py-4">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
          How it works
        </p>
        {mode === 'jd' ? (
          <ul className="text-[10px] text-gray-700 space-y-1.5 leading-relaxed">
            <li>· AI reads the JD and your current resume</li>
            <li>· Reorders bullets to match JD priorities</li>
            <li>· Rewrites summary to align with the role</li>
            <li>· Does NOT invent skills or experience</li>
            <li>· Creates a new version — base stays untouched</li>
          </ul>
        ) : (
          <ul className="text-[10px] text-gray-700 space-y-1.5 leading-relaxed">
            <li>· AI makes only the change you describe</li>
            <li>· Everything else stays identical</li>
            <li>· Creates a new version from the active one</li>
            <li>· Works on any currently selected version</li>
          </ul>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
