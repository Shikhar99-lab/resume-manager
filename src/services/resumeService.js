/**
 * resumeService — frontend side of the AI integration
 *
 * This file only talks to OUR Express backend at /api/*.
 * It knows nothing about Groq directly — that's the backend's job.
 * This separation means you can swap the AI provider on the backend
 * without touching any frontend code.
 */

/**
 * Ask the backend to generate a modified resume.
 *
 * @param {object} resumeData   - The currently active version's data
 * @param {string} userInput    - The JD text or the user's prompt
 * @param {'jd'|'prompt'} mode  - Which type of input
 * @param {function} onProgress - Optional status callback for UI updates
 * @returns {Promise<object>}   - The modified resume data object
 */
export async function generateResumeVersion(resumeData, userInput, mode, onProgress) {
  onProgress?.('Sending to Groq (llama-3.3-70b)…')

  let response
  try {
    response = await fetch('/api/generate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, userInput, mode }),
    })
  } catch {
    throw new Error('Could not reach the backend. Make sure you ran "npm run dev".')
  }

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.error ?? `Server error ${response.status}`)
  }

  onProgress?.('Done!')
  return json.data
}

/** Check backend + Groq key health — used by App.jsx for the status pill */
export async function checkConnection() {
  try {
    const res = await fetch('/api/health')
    if (!res.ok) return { ok: false, model: null }
    return await res.json()   // { ok: boolean, model: string }
  } catch {
    return { ok: false, model: null }
  }
}
