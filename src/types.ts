export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experienceYears: number;
  skills: string[];
  education: string;
  atsScore: number;
  resumeText: string;
  status: 'Unreviewed' | 'Shortlisted' | 'Rejected';
  matchAnalysis: string;
}

export interface JobProfile {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  description: string;
}
