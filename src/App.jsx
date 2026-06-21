/**
 * App.jsx — Root Component
 *
 * This is the top of the component tree. It:
 * 1. Calls useVersions() to get all state and actions
 * 2. Renders the 3-panel layout: VersionPanel | ResumePreview | InputPanel
 * 3. Passes state DOWN as props, callbacks UP via props
 *
 * DATA FLOW IN REACT (one-way):
 *   App (state lives here)
 *     ├── VersionPanel  ← receives versions, activeId, callbacks
 *     ├── ResumePreview ← receives activeVersion.data
 *     └── InputPanel    ← receives isGenerating, onGenerate callback
 *
 * This is called "lifting state up" — state lives in the closest common ancestor.
 */

import { useEffect, useState } from 'react'
import { useVersions } from './hooks/useVersions'
import { checkOllamaConnection } from './services/ollamaService'
import VersionPanel from './components/VersionPanel'
import ResumePreview from './components/ResumePreview'
import InputPanel from './components/InputPanel'

export default function App() {
  const {
    versions,
    activeVersion,
    activeId,
    isGenerating,
    generationStatus,
    generationError,
    selectVersion,
    deleteVersion,
    renameVersion,
    generateVersion,
    clearError,
  } = useVersions()

  // Check if Ollama is reachable on startup
  const [ollamaOk, setOllamaOk] = useState(null) // null = checking, true/false = result

  useEffect(() => {
    checkOllamaConnection().then(setOllamaOk)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* ─── Top Header ─── */}
      <header className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-tight">Resume Manager</span>
          {activeVersion && (
            <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full">
              Viewing: <span className="text-gray-200">{activeVersion.name}</span>
            </span>
          )}
        </div>

        {/* Ollama status pill */}
        <div className="flex items-center gap-2">
          {ollamaOk === null && (
            <span className="text-xs text-gray-600">Checking Ollama…</span>
          )}
          {ollamaOk === true && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Ollama connected
            </span>
          )}
          {ollamaOk === false && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Ollama offline —{' '}
              <code className="text-red-300 bg-red-950 px-1 rounded">ollama serve</code>
            </span>
          )}
        </div>
      </header>

      {/* ─── Main 3-panel layout ─── */}
      {/*
        flex-1 makes this div take all remaining height after the header.
        overflow-hidden on the row prevents the whole page from scrolling —
        each panel scrolls independently.
      */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — version list */}
        <VersionPanel
          versions={versions}
          activeId={activeId}
          onSelect={selectVersion}
          onDelete={deleteVersion}
          onRename={renameVersion}
        />

        {/* Center panel — resume preview (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <ResumePreview data={activeVersion?.data} />
        </div>

        {/* Right panel — AI input */}
        <InputPanel
          activeVersion={activeVersion}
          isGenerating={isGenerating}
          generationStatus={generationStatus}
          generationError={generationError}
          onGenerate={generateVersion}
          onClearError={clearError}
        />
      </div>
    </div>
  )
}
