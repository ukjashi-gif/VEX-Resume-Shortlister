VEX Resume Shortlister
> A recruiter-friendly ATS resume shortlisting and candidate ranking platform built with React, TypeScript, and Vite.
---
Overview
VEX Resume Shortlister is a fully client-side ATS (Applicant Tracking System) dashboard that helps recruiters rank, filter, and shortlist candidates against configurable job profiles — all in the browser, with no backend required.
It includes an intelligent ATS scoring engine, a resume text parser, D3-powered skills analytics, multi-format export, and a built-in AI recruiter chat assistant.
---
Features
Live ATS Scoring — Each candidate is scored against the active job profile using a weighted algorithm (skills match 50%, experience 30%, keyword density 20%).
Job Profile Editor — Configure required skills, preferred skills, minimum experience, and job description on the fly. Scores recalculate instantly.
Automated Resume Parser — Paste raw resume text and the engine auto-extracts name, title, skills, experience, education, and contact details.
JSON / File Import — Bulk-import candidates via JSON or drag-and-drop file upload.
Advanced Filters & Sorting — Filter by ATS score threshold, experience years, specific skills, and free-text search. Sort by score, experience, or name.
Auto-Shortlist — Set a target shortlist count and let the ranker automatically mark the top N candidates.
Skills Frequency Chart — D3-powered interactive bar chart showing skill distribution across the candidate pool. Click bars to activate skill filters.
Candidate Drawer — Detailed side panel for each candidate showing ATS score breakdown, match analysis, skills, and contact info.
Export — Export shortlisted or all candidates as JSON or CSV.
VEX AI Recruiter Chat — Slide-in assistant panel for quick recruiter queries about the current candidate pool.
Persistent State — Candidates, job profiles, filters, and shortlist config are saved to `localStorage` and restored on reload.
---
Tech Stack
Layer	Technology
Framework	React 19 + TypeScript
Build Tool	Vite 6
Styling	Tailwind CSS v4
Charts	D3.js v7
Animations	Motion (Framer Motion)
Icons	Lucide React
AI (optional)	Google Gemini API (`@google/genai`)
---
Project Structure
```
vex-resume-shortlister/
├── src/
│   ├── App.tsx                        # Main application component
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Global styles
│   ├── types.ts                       # Candidate & JobProfile TypeScript interfaces
│   ├── utils/
│   │   └── atsEngine.ts               # ATS scoring & resume parsing logic
│   └── data/
│       ├── sampleCandidates.ts        # Built-in sample data & default job profiles
│       └── components/
│           ├── SkillsFrequencyChart.tsx  # D3 bar chart component
│           ├── AnimatedHeading.tsx       # Animated text heading
│           └── FadeIn.tsx                # Fade-in wrapper component
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```
---
Getting Started
Prerequisites
Node.js v18 or higher
npm
Installation
```bash
# Clone the repository
git clone https://github.com/your-username/vex-resume-shortlister.git
cd vex-resume-shortlister

# Install dependencies
npm install
```
Running Locally
```bash
npm run dev
```
The app runs at `http://localhost:3000`.
Build for Production
```bash
npm run build
```
Output goes to the `dist/` folder and can be deployed to any static host (Vercel, Netlify, GitHub Pages, etc.).
---
Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```
Variable	Required	Description
`GEMINI_API_KEY`	Optional	Google Gemini API key for AI-powered features
`APP_URL`	Optional	Deployment URL (used for self-referential links)
The app works fully without a Gemini API key — the chat assistant runs on rule-based responses by default.
---
ATS Scoring Algorithm
Scores are computed per-candidate per-job-profile on the client:
```
Final Score = (Skill Score × 0.50) + (Experience Score × 0.30) + (Keyword Score × 0.20)
```
Skill Score — Checks both the candidate's explicit skills list and raw resume text for required (85% weight) and preferred (15% weight) skills.
Experience Score — Compares `experienceYears` against the profile's minimum; shortfall is penalised proportionally.
Keyword Score — Counts keyword frequency in raw resume text for required skills, preferred skills, and job title.
---
Candidate Data Schema
For JSON import, each candidate object should match:
```json
{
  "id": "unique-string",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 0100",
  "location": "San Francisco, CA",
  "title": "Senior Frontend Engineer",
  "experienceYears": 5,
  "skills": ["React", "TypeScript", "Tailwind CSS"],
  "education": "B.S. Computer Science, MIT",
  "resumeText": "Full plain-text resume content...",
  "atsScore": 0,
  "status": "Unreviewed",
  "matchAnalysis": ""
}
```
`atsScore` and `matchAnalysis` are computed automatically after import — you can pass `0` and `""` as placeholders.
---
Scripts
Command	Description
`npm run dev`	Start development server on port 3000
`npm run build`	Production build
`npm run preview`	Preview the production build locally
`npm run lint`	TypeScript type check (no emit)
`npm run clean`	Remove `dist/` and `server.js`
---
License
MIT
