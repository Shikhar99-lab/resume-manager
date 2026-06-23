/**
 * ResumePreview
 *
 * Takes a `data` object (the resume JSON) and renders it as the
 * pixel-perfect resume. The layout is identical to the original HTML file.
 *
 * KEY REACT CONCEPTS USED HERE:
 * - Props: data is passed in from the parent (App.jsx)
 * - Array.map(): to render lists (experience, skills, etc.)
 * - Object.entries(): to iterate over the skills object
 * - Conditional rendering: {array.length > 0 && <section>...</section>}
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
 * ResumeCard — the actual A4 resume layout.
 * Separated so we can render it in both screen view and print area.
 */
function ResumeCard({ data }) {
  return (
    <div className="resume">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="sidebar">
        <div className="sidebar-name">{data.name}</div>
        <div className="sidebar-title">{data.title}</div>

        {/* Contact */}
        <div className="sidebar-section">
          <div className="s-label">Contact</div>
          {data.contact.location && (
            <div className="contact-item">
              <span>Location</span>
              {data.contact.location}
            </div>
          )}
          {data.contact.mobile && (
            <div className="contact-item">
              <span>Mobile</span>
              {data.contact.mobile}
            </div>
          )}
          {data.contact.email && (
            <div className="contact-item">
              <span>Email</span>
              {data.contact.email}
            </div>
          )}
          {data.contact.portfolio && (
            <div className="contact-item">
              <span>Portfolio</span>
              {data.contact.portfolio}
            </div>
          )}
          {data.contact.linkedin && (
            <div className="contact-item">
              <span>LinkedIn</span>
              {data.contact.linkedin}
            </div>
          )}
          {data.contact.github && (
            <div className="contact-item">
              <span>GitHub</span>
              {data.contact.github}
            </div>
          )}
        </div>

        {/* Skills — Object.entries() turns {Frontend: [...], Backend: [...]} into pairs */}
        <div className="sidebar-section">
          <div className="s-label">Core Skills</div>
          {Object.entries(data.skills).map(([category, skillList]) => (
            <div key={category} className="skill-category">
              <div className="skill-category-label">{category}</div>
              <div className="skills-grid">
                {skillList.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        {data.education?.length > 0 && (
          <div className="sidebar-section">
            <div className="s-label">Education</div>
            {data.education.map((edu, i) => (
              <div key={i} className="edu-item">
                <div className="edu-year">{edu.year}</div>
                <div className="edu-degree">{edu.degree}</div>
                <div className="edu-inst">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {data.languages?.length > 0 && (
          <div className="sidebar-section">
            <div className="s-label">Languages</div>
            {data.languages.map((lang) => (
              <div key={lang} className="lang-item">
                {lang}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ─── RIGHT MAIN ─── */}
      <main className="main">
        {/* Summary */}
        {data.summary && (
          <div className="summary">
            <p>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div className="section">
            <div className="section-heading">Professional Experience</div>
            {data.experience.map((job, i) => (
              <div key={i} className="job">
                <div className="job-header">
                  <div className="job-title">{job.title}</div>
                  <div className="job-period">{job.period}</div>
                </div>
                <div className="job-company">
                  {job.company}
                  {job.location ? ` · ${job.location}` : ''}
                </div>
                <ul>
                  {job.bullets.map((bullet, j) => (
                    <li key={j}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <div className="section">
            <div className="section-heading">Certifications</div>
            <div className="job">
              <ul>
                {data.certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Awards */}
        {data.awards?.length > 0 && (
          <div className="section">
            <div className="section-heading">Awards</div>
            <div className="job">
              <ul>
                {data.awards.map((award, i) => (
                  <li key={i}>{award}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
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
