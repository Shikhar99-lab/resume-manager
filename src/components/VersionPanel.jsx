/**
 * VersionPanel — Left sidebar
 *
 * Shows the list of all resume versions.
 * Clicking one selects it. Double-clicking the name lets you rename it.
 * Trash icon deletes it (base version can't be deleted).
 *
 * REACT CONCEPTS:
 * - Controlled input: rename input's value is React state
 * - Event handling: onClick, onDoubleClick, onKeyDown
 * - Conditional rendering with ternary: {editing ? <input> : <span>}
 */

import { useState } from 'react'

export default function VersionPanel({ versions, activeId, onSelect, onDelete, onRename }) {
  // Track which version is in rename mode (by id, or null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  function startRename(version) {
    setEditingId(version.id)
    setEditName(version.name)
  }

  function commitRename() {
    if (editName.trim()) {
      onRename(editingId, editName.trim())
    }
    setEditingId(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div id="version-panel" className="flex flex-col h-full bg-gray-950 text-gray-300 w-60 shrink-0 border-r border-gray-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Versions
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </p>
      </div>

      {/* Version list — scrollable */}
      <div className="flex-1 overflow-y-auto py-2">
        {versions.map((version) => {
          const isActive = version.id === activeId
          const isBase = version.source === 'base'

          return (
            <div
              key={version.id}
              onClick={() => onSelect(version.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-900/40 border-l-2 border-blue-400'
                  : 'hover:bg-gray-800/60 border-l-2 border-transparent'
              }`}
            >
              {/* Icon — different for base vs generated */}
              <div className="shrink-0">
                {isBase ? (
                  <span className="text-blue-400 text-xs">⬡</span>
                ) : version.source === 'jd' ? (
                  <span className="text-emerald-400 text-xs">◆</span>
                ) : (
                  <span className="text-purple-400 text-xs">◇</span>
                )}
              </div>

              {/* Name — double click to rename */}
              <div className="flex-1 min-w-0">
                {editingId === version.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-gray-700 text-white text-xs px-1.5 py-0.5 rounded outline-none border border-blue-500"
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      startRename(version)
                    }}
                    className="block text-xs font-medium truncate"
                    title={version.name}
                  >
                    {version.name}
                  </span>
                )}

                {/* Metadata line */}
                <span className="block text-[10px] text-gray-600 mt-0.5">
                  {formatDate(version.createdAt)}
                  {version.source !== 'base' && (
                    <span className="ml-1.5 text-gray-700">
                      · {version.source === 'jd' ? 'from JD' : 'from prompt'}
                    </span>
                  )}
                </span>
              </div>

              {/* Delete button — hidden until hover, disabled for base */}
              {!isBase && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${version.name}"?`)) {
                      onDelete(version.id)
                    }
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-0.5 rounded"
                  title="Delete version"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend at the bottom */}
      <div className="px-4 py-3 border-t border-gray-800 space-y-1">
        <p className="text-[10px] text-gray-700 flex items-center gap-1.5">
          <span className="text-blue-400">⬡</span> Base resume
        </p>
        <p className="text-[10px] text-gray-700 flex items-center gap-1.5">
          <span className="text-emerald-400">◆</span> Generated from JD
        </p>
        <p className="text-[10px] text-gray-700 flex items-center gap-1.5">
          <span className="text-purple-400">◇</span> Edited via prompt
        </p>
        <p className="text-[10px] text-gray-600 mt-2">Double-click name to rename</p>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3v1H4v2h1v13a2 2 0 002 2h10a2 2 0 002-2V6h1V4h-5V3H9zm0 5h2v9H9V8zm4 0h2v9h-2V8z" />
    </svg>
  )
}
