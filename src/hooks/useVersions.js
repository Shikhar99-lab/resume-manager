/**
 * useVersions — Custom React Hook
 *
 * WHAT IS A CUSTOM HOOK?
 * A custom hook is just a regular JS function whose name starts with "use".
 * It can call other React hooks (useState, useEffect) and bundles related
 * logic together so your component stays clean.
 *
 * This hook owns ALL version management: reading from/writing to localStorage,
 * adding/deleting/selecting versions, and generating new ones via Ollama.
 *
 * WHY LOCALSTORAGE?
 * - No backend needed — data lives in the browser
 * - Persists across page refreshes
 * - Simple key/value store — our versions array serializes to JSON perfectly
 * - Limit: ~5MB, which is plenty for text-based resume data
 */

import { useState, useEffect, useCallback } from 'react'
import { baseVersion, createVersion } from '../data/baseResume'
import { generateResumeVersion } from '../services/ollamaService'

const STORAGE_KEY = 'resume_manager_versions'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    // If JSON is corrupted, start fresh
    return null
  }
}

function saveToStorage(versions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
}

export function useVersions() {
  /**
   * useState — holds the array of all versions in React memory.
   * Initialized by reading localStorage. If nothing there, start with baseVersion.
   *
   * useState(initializer): if you pass a FUNCTION instead of a value,
   * React only calls it once on mount (lazy initialization).
   * This avoids parsing localStorage on every render.
   */
  const [versions, setVersions] = useState(() => {
    const stored = loadFromStorage()
    return stored ?? [baseVersion]
  })

  // Which version the user is currently viewing (by id)
  const [activeId, setActiveId] = useState(() => {
    const stored = loadFromStorage()
    return stored?.[0]?.id ?? baseVersion.id
  })

  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')
  const [generationError, setGenerationError] = useState(null)

  /**
   * useEffect — runs a side effect after render.
   * Here: whenever `versions` changes, sync it to localStorage.
   *
   * The dependency array [versions] means: re-run this effect
   * only when `versions` changes.
   */
  useEffect(() => {
    saveToStorage(versions)
  }, [versions])

  /** The currently viewed version object */
  const activeVersion = versions.find((v) => v.id === activeId) ?? versions[0]

  /**
   * useCallback — memoizes a function so it doesn't get re-created on every render.
   * Important when passing callbacks as props, because a new function reference
   * would cause child components to re-render unnecessarily.
   */
  const selectVersion = useCallback((id) => {
    setActiveId(id)
  }, [])

  const deleteVersion = useCallback(
    (id) => {
      // Never allow deleting the base version (first one / source:'base')
      const version = versions.find((v) => v.id === id)
      if (!version || version.source === 'base') return

      const updated = versions.filter((v) => v.id !== id)
      setVersions(updated)

      // If we deleted the active one, switch to the first version
      if (activeId === id) {
        setActiveId(updated[0].id)
      }
    },
    [versions, activeId]
  )

  const renameVersion = useCallback(
    (id, newName) => {
      setVersions((prev) =>
        prev.map((v) => (v.id === id ? { ...v, name: newName } : v))
      )
    },
    []
  )

  /**
   * generateVersion — the main AI generation flow.
   *
   * Steps:
   * 1. Mark as generating (shows spinner in UI)
   * 2. Call Ollama with current version's data + user input
   * 3. Wrap the returned data in a new version object
   * 4. Add to the versions array
   * 5. Auto-select the new version
   */
  const generateVersion = useCallback(
    async (userInput, mode) => {
      setIsGenerating(true)
      setGenerationError(null)
      setGenerationStatus('')

      try {
        const newData = await generateResumeVersion(
          activeVersion.data,
          userInput,
          mode,
          (msg) => setGenerationStatus(msg) // progress callback
        )

        // Auto-name the version based on the input
        const autoName =
          mode === 'jd'
            ? `JD Version ${versions.filter((v) => v.source === 'jd').length + 1}`
            : `Edit ${versions.filter((v) => v.source === 'prompt').length + 1}`

        const newVersion = createVersion(newData, {
          name: autoName,
          source: mode,
          sourceContent: userInput,
          parentId: activeVersion.id,
        })

        // Spread into new array — React needs a NEW array reference to detect the change
        setVersions((prev) => [...prev, newVersion])
        setActiveId(newVersion.id)
      } catch (err) {
        setGenerationError(err.message)
      } finally {
        setIsGenerating(false)
        setGenerationStatus('')
      }
    },
    [activeVersion, versions]
  )

  return {
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
    clearError: () => setGenerationError(null),
  }
}
