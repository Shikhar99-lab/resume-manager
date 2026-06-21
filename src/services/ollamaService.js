/**
 * OLLAMA SERVICE
 *
 * Ollama runs locally on your Mac at http://localhost:11434
 * It exposes a REST API — no cloud, no API key, completely private.
 *
 * We use the /api/generate endpoint with format:"json" which forces
 * the model to output valid JSON (Ollama's built-in grammar enforcement).
 *
 * Model choice for M1 MacBook Air:
 *   qwen2.5:3b  — 1.9 GB, excellent structured output, fast on Apple Silicon
 *   llama3.2:1b — 1.3 GB, fastest, slightly less accurate on complex prompts
 */

const OLLAMA_URL = 'http://localhost:11434/api/generate'
const MODEL = 'qwen2.5:3b'

/**
 * Builds the prompt we send to the model.
 *
 * Why a prompt like this works:
 * - We give the model the EXACT JSON structure to return
 * - We tell it what NOT to do (fabricate, invent, hallucinate)
 * - We keep temperature low (0.2) for consistent, reproducible output
 * - format:"json" in Ollama forces valid JSON at the grammar level
 */
function buildPrompt(resumeData, userInput, mode) {
  const modeInstruction =
    mode === 'jd'
      ? `You are tailoring this resume to better match the following job description.
Reorder bullet points to highlight the most relevant experience first.
Update the summary to align with the role.
Reorder skills categories if it helps emphasize what the JD needs.
Do NOT invent skills or experience that are not already present.`
      : `You are modifying this resume based on the following instruction from the user.
Make only the changes requested. Keep everything else identical.`

  return `You are a professional resume editor. Your ONLY output must be a valid JSON object with the exact same structure as the input JSON.

${modeInstruction}

RULES:
- Return ONLY the JSON object. No explanation, no markdown, no code fences.
- Keep ALL fields. Never remove a field.
- Never invent skills, jobs, dates, or credentials not present in the original.
- You may rephrase bullet points to better match keywords in the request.
- You may reorder items within arrays.
- The JSON schema must remain identical.

CURRENT RESUME JSON:
${JSON.stringify(resumeData, null, 2)}

${mode === 'jd' ? 'JOB DESCRIPTION' : 'USER INSTRUCTION'}:
${userInput}

Return the updated resume JSON now:`
}

/**
 * Main function — sends resume JSON + user input to Ollama, gets back modified JSON.
 *
 * @param {object} resumeData - The current version's data object
 * @param {string} userInput  - The JD text or the user's prompt
 * @param {'jd'|'prompt'} mode - Which type of input
 * @param {function} onProgress - Optional callback(message) for status updates
 * @returns {Promise<object>} - The modified resume data object
 */
export async function generateResumeVersion(resumeData, userInput, mode = 'jd', onProgress) {
  onProgress?.('Connecting to Ollama...')

  let response
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: buildPrompt(resumeData, userInput, mode),
        stream: false,       // Wait for full response before returning
        format: 'json',      // Ollama grammar enforcement — guarantees valid JSON output
        options: {
          temperature: 0.2,  // Low = more deterministic, less creative (good for structured output)
          num_predict: 8192, // Max tokens to generate — resume JSON can be long
        },
      }),
    })
  } catch (err) {
    // fetch() itself throws if Ollama isn't running
    throw new Error(
      'Could not connect to Ollama. Make sure it is running: open Terminal and run "ollama serve"'
    )
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Ollama returned an error: ${response.status} — ${text}`)
  }

  onProgress?.('Parsing AI response...')

  const result = await response.json()

  // result.response is a string containing the JSON the model generated
  let parsed
  try {
    parsed = JSON.parse(result.response)
  } catch {
    throw new Error(
      'The model returned invalid JSON. Try again or use a different prompt.'
    )
  }

  // Basic sanity check — make sure the model returned something that looks like a resume
  if (!parsed.name || !parsed.experience || !parsed.skills) {
    throw new Error(
      'The model returned an unexpected structure. Try simplifying your prompt.'
    )
  }

  onProgress?.('Done!')
  return parsed
}

/** Check if Ollama is running — used to show a warning in the UI */
export async function checkOllamaConnection() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

/** Get the list of locally available models */
export async function getAvailableModels() {
  try {
    const res = await fetch('http://localhost:11434/api/tags')
    if (!res.ok) return []
    const data = await res.json()
    return data.models?.map((m) => m.name) ?? []
  } catch {
    return []
  }
}

export { MODEL }
