/**
 * ResumePreview
 *
 * Renders the resume JSON as a SINGLE-COLUMN, ATS-friendly document.
 *
 * WHY SINGLE COLUMN?
 * Applicant Tracking Systems (Greenhouse, Workday, Lever, Taleo) flatten a PDF
 * into one left-to-right text stream. A two-column layout interleaves the
 * sidebar with the body and scrambles the parsed output. A single column reads
 * top-to-bottom in the exact order a human (and the parser) expects.
 *
 * OTHER ATS-SAFE CHOICES MADE HERE:
 * - Real <ul>/<li> bullets via list-style (not CSS ::before pseudo-content,
 *   which the PDF text layer does not always export).
 * - Skills printed as plain comma-separated text per category, not styled tags.
 * - Standard, recognizable section headings ("Skills", "Experience", etc.).
 * - No icons, images, tables, or text boxes — just headings and text.
 */

import './ResumePreview.css'

export default function ResumePreview({ data }) {
  if (!data) return null

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center py-8 px-4 bg-[#e8e4df] min-h-full">
      <div className="w-full max-w-[794px] flex justify-end mb-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white text-xs font-medium px-5 py-2 rounded-sm hover:bg-[#333] transition-colors tracking-wider"
        >
          <DownloadIcon />
          Download PDF
        </button>
      </div>

      {/*
        resume-print-target is the class the print CSS watches for.
        On screen: renders normally. On print: everything else goes
        visibility:hidden and this becomes visibility:visible.
      */}
      <div className="resume-root resume-print-target">
        <ResumeCard data={data} />
      </div>
    </div>
  )
}

/**
 * ResumeCard — single-column A4 resume.
 */
function ResumeCard({ data }) {
  // Build an ordered list of present contact entries so we can join them
  // with separators without leaving dangling " | " for missing fields.
  const contactParts = [
    data.contact.location,
    data.contact.mobile,
    data.contact.email,
    data.contact.portfolio,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean)

  return (
    <div className="resume">
      {/* ─── HEADER ─── */}
      <header className="resume-header">
        <h1 className="resume-name">{data.name}</h1>
        {data.title && <div className="resume-title">{data.title}</div>}
        {contactParts.length > 0 && (
          <div className="resume-contact">
            {contactParts.map((part, i) => (
              <span key={i} className="contact-piece">
                {part}
                {i < contactParts.length - 1 && (
                  <span className="contact-sep"> | </span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* ─── SUMMARY ─── */}
      {data.summary && (
        <section className="section">
          <h2 className="section-heading">Summary</h2>
          <p className="summary-text">{data.summary}</p>
        </section>
      )}

      {/* ─── SKILLS ─── */}
      {data.skills && Object.keys(data.skills).length > 0 && (
        <section className="section">
          <h2 className="section-heading">Skills</h2>
          {Object.entries(data.skills).map(([category, skillList]) => (
            <div key={category} className="skill-line">
              <span className="skill-category">{category}: </span>
              <span className="skill-list">{skillList.join(', ')}</span>
            </div>
          ))}
        </section>
      )}

      {/* ─── EXPERIENCE ─── */}
      {data.experience?.length > 0 && (
        <section className="section">
          <h2 className="section-heading">Professional Experience</h2>
          {data.experience.map((job, i) => (
            <div key={i} className="job">
              <div className="job-header">
                <div className="job-title">{job.title}</div>
                <div className="job-period">{job.period}</div>
              </div>
              <div className="job-company">
                {job.company}
                {job.location ? `, ${job.location}` : ''}
              </div>
              <ul>
                {job.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ─── EDUCATION ─── */}
      {data.education?.length > 0 && (
        <section className="section">
          <h2 className="section-heading">Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="edu-item">
              <div className="edu-header">
                <span className="edu-degree">{edu.degree}</span>
                <span className="edu-year">{edu.year}</span>
              </div>
              <div className="edu-inst">{edu.institution}</div>
            </div>
          ))}
        </section>
      )}

      {/* ─── CERTIFICATIONS ─── */}
      {data.certifications?.length > 0 && (
        <section className="section">
          <h2 className="section-heading">Certifications</h2>
          <ul>
            {data.certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── AWARDS ─── */}
      {data.awards?.length > 0 && (
        <section className="section">
          <h2 className="section-heading">Awards</h2>
          <ul>
            {data.awards.map((award, i) => (
              <li key={i}>{award}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── LANGUAGES ─── */}
      {data.languages?.length > 0 && (
        <section className="section">
          <h2 className="section-heading">Languages</h2>
          <p className="languages-text">{data.languages.join(', ')}</p>
        </section>
      )}
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 8h14v2H5v-2z" />
    </svg>
  )
}
