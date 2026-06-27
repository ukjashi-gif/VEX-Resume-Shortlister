import { Candidate, JobProfile } from '../types';

/**
 * Dynamically calculates the ATS score and generates a match analysis for a candidate
 * against a given job profile.
 */
export function calculateAtsScore(candidate: Candidate, profile: JobProfile): { score: number; analysis: string } {
  const resumeLower = (candidate.resumeText || '').toLowerCase();
  
  // 1. Core Skills Match (50% weight)
  // We check both the explicit skills list and raw resume text for required/preferred skills
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  
  profile.requiredSkills.forEach(skill => {
    const hasSkillExplicit = candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase());
    const hasSkillInText = resumeLower.includes(skill.toLowerCase());
    
    if (hasSkillExplicit || hasSkillInText) {
      matchedRequired.push(skill);
    } else {
      missingRequired.push(skill);
    }
  });

  const matchedPreferred: string[] = [];
  profile.preferredSkills.forEach(skill => {
    const hasSkillExplicit = candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase());
    const hasSkillInText = resumeLower.includes(skill.toLowerCase());
    
    if (hasSkillExplicit || hasSkillInText) {
      matchedPreferred.push(skill);
    }
  });

  const reqRatio = profile.requiredSkills.length > 0 ? matchedRequired.length / profile.requiredSkills.length : 1;
  const prefRatio = profile.preferredSkills.length > 0 ? matchedPreferred.length / profile.preferredSkills.length : 1;
  
  const skillScore = (reqRatio * 85) + (prefRatio * 15);

  // 2. Experience Match (30% weight)
  let expScore = 100;
  if (candidate.experienceYears < profile.minExperienceYears) {
    if (profile.minExperienceYears > 0) {
      expScore = Math.max(20, Math.round((candidate.experienceYears / profile.minExperienceYears) * 100));
    } else {
      expScore = 100;
    }
  } else {
    // Extra years of experience can give a small bonus up to 100%
    const extraYears = candidate.experienceYears - profile.minExperienceYears;
    expScore = Math.min(100, 100 + (extraYears * 2));
  }

  // 3. Keyword/Content Match (20% weight)
  // Check occurrences of core skills and job title in raw resume text
  let keywordMatches = 0;
  const allTargetKeywords = [...profile.requiredSkills, ...profile.preferredSkills, profile.title];
  allTargetKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = resumeLower.match(regex);
    if (matches) {
      keywordMatches += matches.length;
    }
  });
  
  const keywordScore = Math.min(100, keywordMatches * 5); // 20 matches = 100% keyword score

  // 4. Combined weighted score
  const finalScore = Math.round((skillScore * 0.5) + (expScore * 0.3) + (keywordScore * 0.2));
  
  // 5. Generate high-quality candidate-specific analysis
  let analysis = '';
  if (finalScore >= 90) {
    analysis = `Excellent match with a stellar ATS rating of ${finalScore}%. `;
  } else if (finalScore >= 75) {
    analysis = `Strong match with a solid ATS rating of ${finalScore}%. `;
  } else if (finalScore >= 60) {
    analysis = `Moderate match rating of ${finalScore}%. `;
  } else {
    analysis = `Low match rating of ${finalScore}%. `;
  }

  // Add detail about skills
  if (missingRequired.length === 0) {
    analysis += `Possesses all ${profile.requiredSkills.length} required core skills. `;
  } else if (matchedRequired.length > 0) {
    analysis += `Has ${matchedRequired.length} out of ${profile.requiredSkills.length} core skills (matched: ${matchedRequired.join(', ')}). `;
  } else {
    analysis += `Lacks major core skills requested for this position. `;
  }

  // Add detail about experience
  if (candidate.experienceYears >= profile.minExperienceYears) {
    analysis += `Exceeds the minimum experience threshold (${candidate.experienceYears} yrs vs ${profile.minExperienceYears} yrs required). `;
  } else {
    analysis += `Experience level is slightly below target (${candidate.experienceYears} yrs vs ${profile.minExperienceYears} yrs required). `;
  }

  if (matchedPreferred.length > 0) {
    analysis += `Bonus preferred skills matched: ${matchedPreferred.slice(0, 3).join(', ')}.`;
  }

  return {
    score: Math.max(10, Math.min(100, finalScore)),
    analysis
  };
}

/**
 * Automated resume string parser that extracts structured candidate information.
 * Supports extracting candidate Name, Email, Phone, estimated Years of Experience, and key skills.
 */
export function parseResumeText(rawText: string, allSkillsPool: string[] = []): Partial<Candidate> {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return {};

  // 1. Try to guess Name (often the very first non-empty line)
  let name = lines[0] || 'Unknown Candidate';
  if (name.length > 50 || name.toLowerCase().includes('resume') || name.toLowerCase().includes('cv')) {
    name = 'Parsed Candidate';
  }

  // 2. Extract Email using regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = rawText.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : 'parsed.candidate@example.com';

  // 3. Extract Phone using regex
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = rawText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 000-0000';

  // 4. Extract Location
  let location = 'Remote / Unspecified';
  const locationLines = lines.slice(0, 5);
  const stateZipRegex = /[A-Z]{2}\s+\d{5}/;
  for (const line of locationLines) {
    if (stateZipRegex.test(line) || line.includes(', CA') || line.includes(', NY') || line.includes(', WA') || line.includes(', TX')) {
      location = line;
      break;
    }
  }

  // 5. Guess Job Title
  let title = 'Software Specialist';
  const titleKeywords = ['Frontend', 'Backend', 'Full Stack', 'Fullstack', 'Data Scientist', 'Machine Learning', 'Product Manager', 'UX Designer', 'Developer', 'Engineer'];
  for (const line of lines.slice(0, 8)) {
    for (const keyword of titleKeywords) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        title = line;
        break;
      }
    }
    if (title !== 'Software Specialist') break;
  }

  // 6. Extract experience years
  let experienceYears = 3; // Default fallback
  const expRegexes = [
    /(\d+)\+?\s*years?\s+of\s+experience/i,
    /(\d+)\+?\s*years?\s+experience/i,
    /experience\s*:\s*(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs/i
  ];
  for (const regex of expRegexes) {
    const match = rawText.match(regex);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > 0 && parsed < 40) {
        experienceYears = parsed;
        break;
      }
    }
  }

  // 7. Extract skills by matching a pre-defined set of key skills
  const commonSkills = [
    'React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'CSS', 'HTML', 'JavaScript', 'Node.js', 'Express',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'GraphQL', 'Drizzle ORM', 'Python', 'PyTorch',
    'TensorFlow', 'Machine Learning', 'NLP', 'LLMs', 'Gemini API', 'Scikit-Learn', 'Vector Databases',
    'Product Strategy', 'Agile', 'Scrum', 'SaaS', 'Roadmapping', 'Jira', 'UX/UI Design', 'Figma', 'Product Analytics',
    'SQL', 'Git', 'Redux', 'Vite', 'Framer Motion', 'C++', 'Java'
  ];
  const matchedSkills: string[] = [];
  const textLower = rawText.toLowerCase();
  
  commonSkills.forEach(skill => {
    // Escape regex characters
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Boundary match
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textLower)) {
      matchedSkills.push(skill);
    }
  });

  // Guess education
  let education = 'B.S. in Computer Science';
  const eduKeywords = ['MIT', 'Stanford', 'University', 'College', 'M.S.', 'Ph.D.', 'B.S.', 'Bachelor', 'Master'];
  for (const line of lines) {
    if (eduKeywords.some(kw => line.includes(kw))) {
      education = line;
      break;
    }
  }

  return {
    id: `parsed-${Date.now()}`,
    name,
    email,
    phone,
    location,
    title,
    experienceYears,
    skills: matchedSkills.length > 0 ? matchedSkills : ['TypeScript', 'React'],
    education,
    status: 'Unreviewed',
    resumeText: rawText
  };
}
