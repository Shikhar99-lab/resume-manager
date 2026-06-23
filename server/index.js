/**
 * Express Backend — Groq Edition
 *
 * Sits between the React frontend and the Groq API.
 * The GROQ_API_KEY lives here in .env, never in the browser.
 *
 * Routes:
 *   GET  /api/health          — frontend uses this to show connection status
 *   POST /api/generate-resume — calls Groq, returns modified resume JSON
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '2mb' }))

// Groq client picks up GROQ_API_KEY from process.env automatically
const groq = new Groq()

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    ok: !!process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
  })
})

// ─── Resume generation ────────────────────────────────────────────────────────

app.post('/api/generate-resume', async (req, res) => {
  const { resumeData, userInput, mode } = req.body

  if (!resumeData || !userInput || !mode) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env file.' })
  }

  /**
   * WHY TWO MESSAGES (system + user)?
   * - system: sets the persona and hard rules that apply to every request
   * - user:   carries the actual resume data + the JD or prompt
   *
   * Splitting them this way gives the model clearer context — the rules
   * don't get buried inside the data payload.
   *
   * response_format: { type: 'json_object' } tells Groq to enforce valid JSON
   * output at the inference level, same idea as Ollama's format:"json".
   */
  const systemPrompt = `You are a professional resume editor. You receive a resume as a JSON object and either a job description or a modification instruction. You return the updated resume as a JSON object.

RULES:
- Output ONLY a valid JSON object. No explanation, no markdown, no code fences, no extra text.
- The output JSON must have exactly the same keys and structure as the input JSON.
- Never invent skills, jobs, dates, certifications, or credentials not present in the original.
- You may rephrase, reorder, or reword existing content to better match the request.
- Never remove a key from the JSON — all fields must be present in the output.`

  const modeInstruction =
    mode === 'jd'
      ? `Tailor this resume to match the job description below.
- Rewrite the summary to align with the role's requirements and tone.
- Reorder bullet points within each job so the most JD-relevant ones come first.
- Reorder skill tags within each category to front-load what the JD mentions.
- Do NOT add any technology or experience that is not already in the resume.`
      : `Apply this modification to the resume. Make only the change described. Keep everything else identical.`

  const userMessage = `${modeInstruction}

CURRENT RESUME JSON:
${JSON.stringify(resumeData, null, 2)}

${mode === 'jd' ? 'JOB DESCRIPTION' : 'INSTRUCTION'}:
${userInput}

Return the updated resume JSON:`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,       // Low = consistent, structured output
      max_tokens: 8192,
      response_format: { type: 'json_object' },  // Grammar-enforced JSON
    })

    const rawText = completion.choices[0].message.content.trim()

    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch {
      return res.status(500).json({
        error: 'Model returned invalid JSON. Try a simpler prompt.',
      })
    }

    if (!parsed.name || !parsed.experience || !parsed.skills) {
      return res.status(500).json({
        error: 'Model returned unexpected structure. Try again.',
      })
    }

    res.json({ data: parsed })
  } catch (err) {
    console.error('[Groq error]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
  console.log(`Groq API key: ${process.env.GROQ_API_KEY ? 'found ✓' : 'MISSING — check .env'}`)
})
