import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  Users, 
  Briefcase, 
  Award, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  X, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  ChevronRight, 
  MessageSquare, 
  Check, 
  Copy, 
  TrendingUp, 
  ArrowUpDown 
} from 'lucide-react';
import { Candidate, JobProfile } from './types';
import { SAMPLE_CANDIDATES, DEFAULT_JOB_PROFILES } from './data/sampleCandidates';
import { calculateAtsScore, parseResumeText } from './utils/atsEngine';
import AnimatedHeading from './components/AnimatedHeading';
import FadeIn from './components/FadeIn';
import SkillsFrequencyChart from './components/SkillsFrequencyChart';

export default function App() {
  // Candidate pool & job profiles state
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('vex_candidates');
      return saved ? JSON.parse(saved) : SAMPLE_CANDIDATES;
    } catch (e) {
      console.error('Failed to load candidates from localStorage', e);
      return SAMPLE_CANDIDATES;
    }
  });

  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>(() => {
    try {
      const saved = localStorage.getItem('vex_job_profiles');
      return saved ? JSON.parse(saved) : DEFAULT_JOB_PROFILES;
    } catch (e) {
      console.error('Failed to load job profiles from localStorage', e);
      return DEFAULT_JOB_PROFILES;
    }
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('vex_selected_profile_id');
      if (saved) return saved;
      return DEFAULT_JOB_PROFILES[0].id;
    } catch (e) {
      console.error('Failed to load selected profile ID from localStorage', e);
      return DEFAULT_JOB_PROFILES[0].id;
    }
  });
  
  // Shortlist config
  const [shortlistCount, setShortlistCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vex_shortlist_count');
      return saved ? Math.max(1, parseInt(saved, 10) || 3) : 3;
    } catch (e) {
      console.error('Failed to load shortlist count from localStorage', e);
      return 3;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vex_candidates', JSON.stringify(candidates));
    } catch (e) {
      console.error('Failed to save candidates to localStorage', e);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem('vex_job_profiles', JSON.stringify(jobProfiles));
    } catch (e) {
      console.error('Failed to save job profiles to localStorage', e);
    }
  }, [jobProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem('vex_selected_profile_id', selectedProfileId);
    } catch (e) {
      console.error('Failed to save selected profile ID to localStorage', e);
    }
  }, [selectedProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem('vex_shortlist_count', shortlistCount.toString());
    } catch (e) {
      console.error('Failed to save shortlist count to localStorage', e);
    }
  }, [shortlistCount]);
  
  // Dashboard navigation tabs
  const [activeTab, setActiveTab] = useState<'ranking' | 'parser' | 'export'>('ranking');
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minAtsScore, setMinAtsScore] = useState<number>(10);
  const [minExpYears, setMinExpYears] = useState<number>(0);
  const [selectedSkillsFilter, setSelectedSkillsFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'exp' | 'name'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Interactive drawer/modal state for viewing single candidate
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Automated resume parser input state
  const [pastedResumeText, setPastedResumeText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingProgress, setParsingProgress] = useState<string>('');
  
  // Import custom candidates state
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  // Side Chat State (VEX AI Recruiter Assistant)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: Date }>>([
    { sender: 'ai', text: 'Welcome to VEX Consulting. I am your ATS Shortlist Agent. Drop a candidate’s name or ask me to draft a job profile with specific requirements.', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // File Upload State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy-to-clipboard state helpers
  const [copiedSampleJson, setCopiedSampleJson] = useState<boolean>(false);

  // Active Job Profile object
  const activeProfile = jobProfiles.find(p => p.id === selectedProfileId) || jobProfiles[0];

  // Dynamic ATS Scoring trigger
  // Re-calculates score for all candidates whenever the active job profile or its details change
  useEffect(() => {
    setCandidates(prev => 
      prev.map(cand => {
        const { score, analysis } = calculateAtsScore(cand, activeProfile);
        return {
          ...cand,
          atsScore: score,
          matchAnalysis: analysis
        };
      })
    );
  }, [selectedProfileId, jobProfiles]);

  // Handle active candidate profile refresh inside modal if candidate list updates
  useEffect(() => {
    if (selectedCandidate) {
      const updated = candidates.find(c => c.id === selectedCandidate.id);
      if (updated) {
        setSelectedCandidate(updated);
      }
    }
  }, [candidates]);

  // Chat auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // Smooth scroll to workspace
  const handleScrollToWorkspace = () => {
    document.getElementById('ats-workspace')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Run ATS Ranking/Shortlisting: Sorts and marks top N as "Shortlisted"
  const handleApplyAutomatedShortlist = () => {
    // Sort all candidates by score descending
    const sorted = [...candidates].sort((a, b) => b.atsScore - a.atsScore);
    
    // Mark top N as Shortlisted, and rest as Unreviewed or unchanged
    const updated = candidates.map(cand => {
      const sortedIndex = sorted.findIndex(s => s.id === cand.id);
      if (sortedIndex !== -1 && sortedIndex < shortlistCount) {
        return { ...cand, status: 'Shortlisted' as const };
      } else {
        return { ...cand, status: 'Unreviewed' as const };
      }
    });

    setCandidates(updated);
    
    // Show a beautiful notification toast / transition to ranking tab
    setActiveTab('ranking');
  };

  // Status handlers
  const handleUpdateStatus = (candidateId: string, status: 'Unreviewed' | 'Shortlisted' | 'Rejected') => {
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? { ...c, status } : c)
    );
  };

  const handleBulkRejectUnshortlisted = () => {
    setCandidates(prev => 
      prev.map(c => c.status !== 'Shortlisted' ? { ...c, status: 'Rejected' as const } : c)
    );
  };

  // Custom Job Profile details editor
  const handleAddRequiredSkill = (skill: string) => {
    if (!skill.trim()) return;
    setJobProfiles(prev => 
      prev.map(p => {
        if (p.id === selectedProfileId) {
          if (p.requiredSkills.some(s => s.toLowerCase() === skill.toLowerCase())) return p;
          return { ...p, requiredSkills: [...p.requiredSkills, skill.trim()] };
        }
        return p;
      })
    );
  };

  const handleRemoveRequiredSkill = (skillToRemove: string) => {
    setJobProfiles(prev => 
      prev.map(p => {
        if (p.id === selectedProfileId) {
          return { ...p, requiredSkills: p.requiredSkills.filter(s => s !== skillToRemove) };
        }
        return p;
      })
    );
  };

  const handleAddPreferredSkill = (skill: string) => {
    if (!skill.trim()) return;
    setJobProfiles(prev => 
      prev.map(p => {
        if (p.id === selectedProfileId) {
          if (p.preferredSkills.some(s => s.toLowerCase() === skill.toLowerCase())) return p;
          return { ...p, preferredSkills: [...p.preferredSkills, skill.trim()] };
        }
        return p;
      })
    );
  };

  const handleRemovePreferredSkill = (skillToRemove: string) => {
    setJobProfiles(prev => 
      prev.map(p => {
        if (p.id === selectedProfileId) {
          return { ...p, preferredSkills: p.preferredSkills.filter(s => s !== skillToRemove) };
        }
        return p;
      })
    );
  };

  const handleUpdateMinExp = (exp: number) => {
    setJobProfiles(prev => 
      prev.map(p => {
        if (p.id === selectedProfileId) {
          return { ...p, minExperienceYears: exp };
        }
        return p;
      })
    );
  };

  // Custom profile creation
  const handleCreateCustomProfile = () => {
    const newProfile: JobProfile = {
      id: `custom-profile-${Date.now()}`,
      title: 'Custom Product Engineer',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
      preferredSkills: ['Next.js', 'PostgreSQL'],
      minExperienceYears: 3,
      description: 'Enter your custom requirements below. All candidate scores in the dashboard will immediately adapt to your specifications.'
    };
    setJobProfiles(prev => [...prev, newProfile]);
    setSelectedProfileId(newProfile.id);
  };

  // Manual Candidate insertion
  const handleCreateNewCandidate = (candidateData: Partial<Candidate>) => {
    const newCandidate: Candidate = {
      id: candidateData.id || `cand-${Date.now()}`,
      name: candidateData.name || 'John Doe',
      email: candidateData.email || 'john.doe@example.com',
      phone: candidateData.phone || '+1 (555) 012-3456',
      location: candidateData.location || 'New York, NY',
      title: candidateData.title || 'Software Engineer',
      experienceYears: candidateData.experienceYears ?? 4,
      skills: candidateData.skills || [],
      education: candidateData.education || 'B.S. Computer Science',
      status: 'Unreviewed',
      resumeText: candidateData.resumeText || '',
      atsScore: 0,
      matchAnalysis: ''
    };

    // Calculate score immediately
    const { score, analysis } = calculateAtsScore(newCandidate, activeProfile);
    newCandidate.atsScore = score;
    newCandidate.matchAnalysis = analysis;

    setCandidates(prev => [newCandidate, ...prev]);
    return newCandidate;
  };

  // Paste single resume text and run automated parser
  const handleRunResumeParser = () => {
    if (!pastedResumeText.trim()) return;
    
    setIsParsing(true);
    setParsingProgress('Reading document layout...');
    
    setTimeout(() => {
      setParsingProgress('Extracting professional summary & key skills...');
      setTimeout(() => {
        setParsingProgress('Running lexical score calculator...');
        setTimeout(() => {
          const parsedData = parseResumeText(pastedResumeText);
          const newCand = handleCreateNewCandidate(parsedData);
          setIsParsing(false);
          setPastedResumeText('');
          // Automatically focus / open details of this newly parsed candidate
          setSelectedCandidate(newCand);
          setActiveTab('ranking');
        }, 400);
      }, 400);
    }, 400);
  };

  // Load predefined sample resume text for testing
  const loadSampleResumeText = (type: 'frontend' | 'ai') => {
    if (type === 'frontend') {
      setPastedResumeText(`SARAH CONNER
Seattle, WA | sarah.conner@example.com | (555) 987-6543

SUMMARY
Senior Front-End Web Engineer with 6 years of expertise building fluid interactive web experiences. Advanced mastery over React, Next.js, and TypeScript, styled with Tailwind CSS utility classes. Extensive record of maximizing SEO indexes and modularizing component design systems.

TECHNICAL STACK
React, Next.js, TypeScript, JavaScript, CSS3, Tailwind CSS, Jest, Vite, Framer Motion, GraphQL, Git

EXPERIENCE
Staff Engineer | Apex Solutions (2022 - 2026)
- Directed a front-end sprint transition to Next.js and Tailwind, reducing bundler size by 50% and doubling site responsiveness.
- Crafted fluid animation structures using modern layouts to ensure beautiful motion physics.

UI Developer | Digital Labs (2020 - 2022)
- Coded and deployed over 40 responsive user-facing tools using React and TypeScript.`);
    } else {
      setPastedResumeText(`DR. ALEX MERCER
Boston, MA | alex.mercer@example.com | (555) 765-4321

PROFESSIONAL SUMMARY
Distinguished Machine Learning Specialist with 6 years of hands-on Python development. Expertise in building, training, and deploying Deep Learning systems using PyTorch and TensorFlow. Specialized in Large Language Models (LLMs), Prompt Engineering, and Semantic search patterns with Vector Databases.

CORE EXPERTISE
Python, Machine Learning, Deep Learning, PyTorch, TensorFlow, NLP, LLMs, Gemini API, Vector Databases, Docker, Git, SQL

ACCOMPLISHMENTS
Machine Learning Researcher | Zenith AI Corp (2022 - Present)
- Designed an interactive Natural Language Processing pipeline in Python and PyTorch that speeds up customer service query routing by 80%.
- Integrated state-of-the-art Google Gemini API vectors for advanced semantic routing and Retrieval Augmented Generation.`);
    }
  };

  // Reusable core parser & score generator for JSON candidate inputs
  const parseAndAddCandidates = (jsonText: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'JSON must be an array of candidate objects.' };
      }
      
      const parsedPool: Candidate[] = [];
      
      parsed.forEach((item: any, idx: number) => {
        if (!item.name) {
          throw new Error(`Item at index ${idx} is missing a "name" field.`);
        }
        
        const cand: Candidate = {
          id: item.id || `imported-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          name: item.name,
          email: item.email || `${item.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: item.phone || '+1 (555) 000-0000',
          location: item.location || 'Remote',
          title: item.title || 'Imported Professional',
          experienceYears: Number(item.experienceYears) || 2,
          skills: Array.isArray(item.skills) ? item.skills : ['TypeScript', 'React'],
          education: item.education || 'Degree Undisclosed',
          status: 'Unreviewed',
          resumeText: item.resumeText || `Imported resume text for ${item.name}.`,
          atsScore: 0,
          matchAnalysis: ''
        };
        
        const { score, analysis } = calculateAtsScore(cand, activeProfile);
        cand.atsScore = score;
        cand.matchAnalysis = analysis;
        parsedPool.push(cand);
      });
      
      setCandidates(prev => [...parsedPool, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON format. Please verify candidate schema.' };
    }
  };

  // Handle uploading candidate JSON file
  const handleImportJson = () => {
    setImportError(null);
    setImportSuccess(false);
    const result = parseAndAddCandidates(importJsonText);
    if (result.success) {
      setImportSuccess(true);
      setImportJsonText('');
      setTimeout(() => setImportSuccess(false), 3000);
      setActiveTab('ranking');
    } else {
      setImportError(result.error || 'Failed to import candidates.');
    }
  };

  // Handle local file uploads (via click or drag-and-drop)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseAndAddCandidates(text);
      if (result.success) {
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
        handleScrollToWorkspace();
        setActiveTab('ranking');
      } else {
        setImportError(result.error || 'Failed to parse JSON file.');
        handleScrollToWorkspace();
        setActiveTab('export');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input element state
  };

  // Drag and drop event handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setImportError(null);
    setImportSuccess(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setImportError('Please upload a valid .json file.');
      handleScrollToWorkspace();
      setActiveTab('export');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseAndAddCandidates(text);
      if (result.success) {
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
        handleScrollToWorkspace();
        setActiveTab('ranking');
      } else {
        setImportError(result.error || 'Failed to parse JSON file.');
        handleScrollToWorkspace();
        setActiveTab('export');
      }
    };
    reader.readAsText(file);
  };

  // Pre-load copyable Sample Candidate JSON structure
  const sampleJsonStructure = `[
  {
    "name": "Jordan Carter",
    "email": "jordan.carter@example.com",
    "phone": "+1 (555) 765-0192",
    "location": "San Diego, CA",
    "title": "React Specialist",
    "experienceYears": 6,
    "skills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "CSS", "Vite"],
    "education": "B.S. in Software Engineering — UC San Diego",
    "resumeText": "Experienced React developer with 6 years of expertise building fast web apps. Specializes in TypeScript, Next.js, and CSS layout optimization."
  },
  {
    "name": "Elena Rostova",
    "email": "elena.r@example.com",
    "phone": "+1 (555) 432-8811",
    "location": "New York, NY",
    "title": "Machine Learning Engineer",
    "experienceYears": 5,
    "skills": ["Python", "PyTorch", "TensorFlow", "Machine Learning", "NLP", "LLMs"],
    "education": "M.S. in Artificial Intelligence — Columbia University",
    "resumeText": "Deep learning engineer with 5 years of Python research. Expert in PyTorch and deploying Large Language Models (LLMs) for commercial solutions."
  }
]`;

  const copySampleJsonToClipboard = () => {
    navigator.clipboard.writeText(sampleJsonStructure);
    setCopiedSampleJson(true);
    setTimeout(() => setCopiedSampleJson(false), 2000);
  };

  // Export current shortlisted or ranked pool as JSON/CSV
  const handleExportData = (format: 'json' | 'csv') => {
    if (sortedExportPool.length === 0) {
      alert('No candidates are currently available to export. Please add or import some candidates first!');
      return;
    }

    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sortedExportPool, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `VEX_Top_Shortlist_${sortedExportPool.length}_Candidates.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Rank,Name,Email,Phone,Location,Title,Experience Years,ATS Match Score,Skills,Education\n";
      
      sortedExportPool.forEach((c, idx) => {
        const row = [
          idx + 1,
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.email}"`,
          `"${c.phone}"`,
          `"${c.location}"`,
          `"${c.title.replace(/"/g, '""')}"`,
          c.experienceYears,
          `${c.atsScore}%`,
          `"${c.skills.join(', ')}"`,
          `"${c.education.replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodedUri);
      downloadAnchor.setAttribute("download", `VEX_Top_Shortlist_${sortedExportPool.length}_Candidates.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  // AI Chat Assistant message response handler
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { sender: 'user' as const, text: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    const prompt = chatInput;
    setChatInput('');

    // Generate intelligent responses matching the resume context or skills
    setTimeout(() => {
      let aiText = "I’ve analyzed that request. Our current top shortlisted candidate is Eleanor Vance with a 98% ATS Match Score, possessing strong React and TypeScript experience.";
      
      const lower = prompt.toLowerCase();
      if (lower.includes('profile') || lower.includes('job') || lower.includes('role')) {
        aiText = "You can easily configure requirements inside the Job Profile pane on the left. Changing minimum years of experience or required skills immediately triggers a live re-evaluation of all candidate ATS metrics.";
      } else if (lower.includes('shortlist') || lower.includes('top')) {
        aiText = `Based on your request, adjusting the shortlist slider to top ${shortlistCount} and clicking "Apply Automated Shortlist" will rank the pool and highlight the top contenders automatically.`;
      } else if (lower.includes('eleanor') || lower.includes('vance')) {
        aiText = "Eleanor Vance is our leading applicant for the Front End Profile (98% match). She brings 7 years of Stanford-backed engineering experience and has deep familiarity with React, Tailwind CSS, and Framer Motion.";
      } else if (lower.includes('marcus') || lower.includes('sterling')) {
        aiText = "Marcus Sterling scored a 95% for the Senior Backend profile. He specializes in Node.js, Express, and highly optimized PostgreSQL schemas, backed by 8 years of database management.";
      } else if (lower.includes('export') || lower.includes('download')) {
        aiText = "To export your results, simply mark the top candidates as 'Shortlisted' (manually or via the automated ranker), go to the 'Shortlist & Export' tab, and click Export as JSON or CSV.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        aiText = "Hello! I am VEX’s virtual recruiting agent. How can I assist you with resume ranking, automated parsing, or shortlisting metrics today?";
      }

      setChatMessages(prev => [...prev, { sender: 'ai' as const, text: aiText, timestamp: new Date() }]);
    }, 600);
  };

  // Filter & Sort Logic for candidates pool
  const filteredCandidates = candidates.filter(cand => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = cand.name.toLowerCase().includes(query) || 
                          cand.title.toLowerCase().includes(query) || 
                          cand.skills.some(s => s.toLowerCase().includes(query));
    
    // 2. Min ATS Score
    const matchesAts = cand.atsScore >= minAtsScore;
    
    // 3. Min Experience
    const matchesExp = cand.experienceYears >= minExpYears;
    
    // 4. Specific Skills Filter
    const matchesSkills = selectedSkillsFilter.length === 0 || 
                          selectedSkillsFilter.every(skill => cand.skills.some(s => s.toLowerCase() === skill.toLowerCase()));
                          
    return matchesSearch && matchesAts && matchesExp && matchesSkills;
  }).sort((a, b) => {
    let multiplier = sortOrder === 'desc' ? 1 : -1;
    if (sortBy === 'score') {
      return (b.atsScore - a.atsScore) * multiplier;
    } else if (sortBy === 'exp') {
      return (b.experienceYears - a.experienceYears) * multiplier;
    } else {
      return a.name.localeCompare(b.name) * multiplier;
    }
  });

  const toggleSkillFilter = (skill: string) => {
    if (selectedSkillsFilter.includes(skill)) {
      setSelectedSkillsFilter(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkillsFilter(prev => [...prev, skill]);
    }
  };

  const handleToggleChartSkill = (skill: string) => {
    if (skill === 'CLEAR_ALL') {
      setSelectedSkillsFilter([]);
    } else {
      toggleSkillFilter(skill);
    }
  };

  // Quick stats calculations
  const totalInPool = candidates.length;
  const avgAtsScore = candidates.length > 0 
    ? Math.round(candidates.reduce((acc, curr) => acc + curr.atsScore, 0) / candidates.length)
    : 0;
  const shortlistedCountActual = candidates.filter(c => c.status === 'Shortlisted').length;
  const rejectedCountActual = candidates.filter(c => c.status === 'Rejected').length;

  // Get top N candidates sorted by ATS score for export/display based on the shortlistCount state
  const sortedExportPool = [...candidates]
    .sort((a, b) => b.atsScore - a.atsScore)
    .slice(0, shortlistCount);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Hidden file input for candidate JSON uploading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />
      
      {/* ================= HERO SECTION (EXACT SPECIFICATION) ================= */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Full-screen background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Elegant Dark Radial Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-45 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000_100%)] pointer-events-none"></div>

        {/* System Status Indicators in top right */}
        <div className="absolute top-6 right-8 p-4 z-20 flex flex-col gap-1 pointer-events-none text-right hidden lg:flex">
          <div className="text-[9px] uppercase tracking-[0.4em] text-zinc-500">System Status</div>
          <div className="text-[10px] font-mono text-zinc-400">ATS_ENGINE_v4.2 // ONLINE</div>
        </div>

        {/* Navbar */}
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pt-6">
          <nav className="liquid-glass rounded-xl px-6 py-3 flex items-center justify-between">
            {/* Left Column: Logo text VEXATS */}
            <div className="text-2xl font-semibold tracking-tight text-white flex items-center gap-1 select-none">
              VEX<span className="text-gray-muted font-light">ATS</span>
              <span className="text-xs font-mono tracking-widest uppercase text-white/40 border-l border-white/20 pl-3 hidden sm:inline">Portal</span>
            </div>

            {/* Center Column: Links Candidates, Analytics, Workflows, Settings */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#ats-workspace" onClick={(e) => { e.preventDefault(); handleScrollToWorkspace(); }} className="text-white hover:text-gray-300 transition-colors">Candidates</a>
              <a href="#ats-workspace" onClick={(e) => { e.preventDefault(); handleScrollToWorkspace(); setActiveTab('parser'); }} className="text-white hover:text-gray-300 transition-colors">Parser</a>
              <a href="#ats-workspace" onClick={(e) => { e.preventDefault(); handleScrollToWorkspace(); setActiveTab('export'); }} className="text-white hover:text-gray-300 transition-colors">Export</a>
              <button onClick={() => setIsChatOpen(true)} className="text-white hover:text-gray-300 transition-colors text-sm font-medium">Assistant</button>
            </div>

            {/* Right Column: Export Top 100 / Chat */}
            <button 
              onClick={() => {
                handleScrollToWorkspace();
                setActiveTab('export');
              }}
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Export Top {shortlistCount}
            </button>
          </nav>
        </div>

        {/* Hero Content (Bottom of viewport) */}
        <div className="relative z-10 px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
          <div className="w-full lg:grid lg:grid-cols-2 lg:items-end gap-12">
            
            {/* Left Column - Main content */}
            <div className="flex flex-col mb-8 lg:mb-0">
              <div>
                {/* Heading: Character-by-character entrance animation */}
                <AnimatedHeading 
                  text={`Shaping tomorrow\nwith vision and action.`}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-none letter-spacing-tight mb-6 text-white"
                  style={{ letterSpacing: '-0.04em' }}
                />

                {/* Subheading: Fade-in animation starting at 800ms */}
                <FadeIn delay={800} duration={1000}>
                  <p className="text-base md:text-lg text-gray-300 mb-8 max-w-lg font-light leading-relaxed">
                    Define your parameters, upload candidate JSON, and let our engine rank the top visionaries for your next venture.
                  </p>
                </FadeIn>

                {/* Buttons row: Fade-in animation starting at 1200ms */}
                <FadeIn delay={1200} duration={1000}>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="liquid-glass rounded-lg px-4 py-3 border border-white/10 flex items-center gap-3">
                      <span className="text-xs uppercase tracking-widest text-gray-muted">Shortlist Size</span>
                      <input 
                        type="number" 
                        value={shortlistCount} 
                        onChange={(e) => setShortlistCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="bg-transparent w-16 text-xl font-medium focus:outline-none text-white font-mono"
                      />
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black px-8 py-4 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <Upload size={16} />
                      <span>Upload candidates.json</span>
                    </button>
                    <button 
                      onClick={handleScrollToWorkspace}
                      className="liquid-glass border border-white/20 text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-black transition-all"
                    >
                      Live Ranking
                    </button>
                  </div>
                </FadeIn>
              </div>
            </div>

            {/* Right Column - Ranking Tab preview bento widget from Design HTML */}
            <div className="flex flex-col items-end gap-4 justify-end">
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/10 rounded-2xl p-6 w-full max-w-md hidden lg:block">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-muted">Ranking Tab</h3>
                    <span className="text-xs text-green-400 font-mono">Real-time Filtering</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">01</div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white">Eleanor Vance</div>
                          <div className="text-[10px] text-gray-muted">React • TypeScript • 7yr</div>
                        </div>
                      </div>
                      <div className="text-lg font-mono font-bold text-white">98.4</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/20 text-white flex items-center justify-center text-xs font-bold">02</div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white">Marcus Sterling</div>
                          <div className="text-[10px] text-gray-muted">Node.js • Express • 8yr</div>
                        </div>
                      </div>
                      <div className="text-lg font-mono font-bold text-gray-300">95.1</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/20 text-white flex items-center justify-center text-xs font-bold">03</div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-white">Elena Rostova</div>
                          <div className="text-[10px] text-gray-muted">Python • PyTorch • 5yr</div>
                        </div>
                      </div>
                      <div className="text-lg font-mono font-bold text-gray-300">94.8</div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={1600} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <p className="text-sm md:text-md lg:text-lg font-light tracking-wide text-white">
                    Parsing. Ranking. Decisions.
                  </p>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </div>

      {/* ================= RECRUITER ATS WORKSPACE SECTION ================= */}
      <div 
        id="ats-workspace" 
        className="bg-[#030303] text-white min-h-screen py-20 px-4 sm:px-6 md:px-12 lg:px-16 border-t border-white/10 relative z-20"
      >
        
        {/* Header container */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/10 border border-white/20 text-white/80 font-mono text-xs px-2.5 py-1 rounded-md tracking-wider uppercase">
                  ATS Command Center
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">VEX Candidate Shortlister</h2>
              <p className="text-sm text-gray-400 mt-1 max-w-2xl font-light">
                Configure your target job requirements, automatically parse resume files, rank candidates, and export the top shortlisted profiles instantly.
              </p>
            </div>
            
            {/* Quick stats panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="liquid-glass border border-white/10 rounded-xl p-3 text-center sm:min-w-[110px]">
                <span className="block text-2xl font-bold tracking-tight text-white">{totalInPool}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Candidate Pool</span>
              </div>
              <div className="liquid-glass border border-white/10 rounded-xl p-3 text-center sm:min-w-[110px]">
                <span className="block text-2xl font-bold tracking-tight text-white text-white/90">{avgAtsScore}%</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Average ATS</span>
              </div>
              <div className="liquid-glass border border-white/10 rounded-xl p-3 text-center sm:min-w-[110px]">
                <span className="block text-2xl font-bold tracking-tight text-white text-white">{shortlistedCountActual}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Shortlisted</span>
              </div>
              <div className="liquid-glass border border-white/10 rounded-xl p-3 text-center sm:min-w-[110px]">
                <span className="block text-2xl font-bold tracking-tight text-white text-gray-400">{rejectedCountActual}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Rejected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace body layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============ LEFT COLUMN: JOB PROFILE CONFIGURATOR (4 cols) ============ */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="liquid-glass border border-white/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-white/80" size={18} />
                  <h3 className="font-semibold text-lg tracking-tight">Job Requirements</h3>
                </div>
                <button 
                  onClick={handleCreateCustomProfile}
                  className="text-xs bg-white/10 border border-white/15 text-white/90 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors font-mono flex items-center gap-1"
                >
                  <Plus size={12} /> Custom
                </button>
              </div>

              {/* Profile Selector */}
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-mono mb-2">Select Active Target Profile</label>
                <select 
                  value={selectedProfileId} 
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                >
                  {jobProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* Editable Job details */}
              <div className="space-y-4">
                
                {/* Years of experience slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
                    <span className="text-gray-400">Min Experience Years</span>
                    <span className="text-white font-medium">{activeProfile.minExperienceYears} yrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="12" 
                    value={activeProfile.minExperienceYears}
                    onChange={(e) => handleUpdateMinExp(parseInt(e.target.value, 10))}
                    className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Core Required Skills */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2 text-gray-400">
                    <span>Required Core Skills</span>
                    <span>{activeProfile.requiredSkills.length} defined</span>
                  </div>
                  
                  {/* Tag list */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {activeProfile.requiredSkills.map(s => (
                      <span 
                        key={s} 
                        className="bg-white text-black font-medium text-xs px-2.5 py-1 rounded-md flex items-center gap-1 select-none"
                      >
                        {s}
                        <button 
                          onClick={() => handleRemoveRequiredSkill(s)} 
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {activeProfile.requiredSkills.length === 0 && (
                      <span className="text-xs text-red-400 font-mono">No required skills. Candidates won't score well.</span>
                    )}
                  </div>

                  {/* Add tag input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const input = form.elements.namedItem('requiredSkillInput') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleAddRequiredSkill(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      name="requiredSkillInput"
                      placeholder="Add required skill (e.g. Docker)..."
                      className="flex-1 bg-zinc-900 border border-white/10 text-xs text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-white transition-colors font-light"
                    />
                    <button type="submit" className="bg-white/10 hover:bg-white/25 border border-white/15 text-white p-1.5 rounded-md transition-colors">
                      <Plus size={14} />
                    </button>
                  </form>
                </div>

                {/* Preferred Skills */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2 text-gray-400">
                    <span>Preferred Bonus Skills</span>
                    <span>{activeProfile.preferredSkills.length} defined</span>
                  </div>
                  
                  {/* Tag list */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {activeProfile.preferredSkills.map(s => (
                      <span 
                        key={s} 
                        className="bg-zinc-850 border border-white/20 text-white font-light text-xs px-2.5 py-1 rounded-md flex items-center gap-1 select-none"
                      >
                        {s}
                        <button 
                          onClick={() => handleRemovePreferredSkill(s)} 
                          className="hover:text-red-400 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add tag input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const input = form.elements.namedItem('preferredSkillInput') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleAddPreferredSkill(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      name="preferredSkillInput"
                      placeholder="Add bonus skill (e.g. AWS)..."
                      className="flex-1 bg-zinc-900 border border-white/10 text-xs text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-white transition-colors font-light"
                    />
                    <button type="submit" className="bg-white/10 hover:bg-white/25 border border-white/15 text-white p-1.5 rounded-md transition-colors">
                      <Plus size={14} />
                    </button>
                  </form>
                </div>

                {/* Brief description viewer */}
                <div className="pt-3 border-t border-white/10">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-1">Target Profile Description</span>
                  <p className="text-xs text-gray-300 font-light leading-relaxed max-h-24 overflow-y-auto">
                    {activeProfile.description}
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Shortlist Count controller panel */}
            <div className="liquid-glass border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="text-white/80" size={18} />
                <h3 className="font-semibold text-lg tracking-tight">Automated Selection</h3>
              </div>
              <p className="text-xs text-gray-400 font-light mb-4 leading-relaxed">
                Configure the target candidate count to immediately narrow down your pool. The system will shortlist the absolute best matching profiles.
              </p>
              
              <div className="flex items-center justify-between gap-4 bg-zinc-900 border border-white/10 rounded-xl p-3.5 mb-4">
                <span className="text-sm font-medium">Top Candidates</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShortlistCount(Math.max(1, shortlistCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={shortlistCount} 
                    onChange={(e) => setShortlistCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-12 bg-transparent text-center font-mono font-bold text-lg focus:outline-none text-white" 
                  />
                  <button 
                    onClick={() => setShortlistCount(shortlistCount + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                onClick={handleApplyAutomatedShortlist}
                className="w-full bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles size={16} />
                Run Shortlisting (Top {shortlistCount})
              </button>
            </div>

          </div>

          {/* ============ RIGHT COLUMN: WORKSPACE CORE TABS & DATA (8 cols) ============ */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Navigation Tabs Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-1 border-b border-white/10">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('ranking')}
                  className={`relative py-2.5 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'ranking' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Candidate Pool & Ranking</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('parser')}
                  className={`relative py-2.5 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'parser' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Resume Parser Tool</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('export')}
                  className={`relative py-2.5 px-4 text-sm font-medium transition-all duration-200 ${activeTab === 'export' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <Download size={16} />
                    <span>Shortlist & Export ({sortedExportPool.length})</span>
                  </div>
                </button>
              </div>

              {/* Shortlist Filter Indicator */}
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Targeting {shortlistCount} of {candidates.length}</span>
              </div>
            </div>

            {/* TAB CONTAINER 1: CANDIDATE POOL & RANKINGS */}
            {activeTab === 'ranking' && (
              <div className="space-y-6">
                
                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                  
                  {/* Search Bar (5 cols) */}
                  <div className="md:col-span-5 relative">
                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-1.5">Search Keywords</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by candidate name, skill, or title..."
                        className="w-full bg-zinc-900/60 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors font-light"
                      />
                    </div>
                  </div>

                  {/* Min ATS Match Score slider (3 cols) */}
                  <div className="md:col-span-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono mb-1.5 text-gray-400">
                      <span>Min ATS Score</span>
                      <span className="text-white font-medium">{minAtsScore}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      value={minAtsScore}
                      onChange={(e) => setMinAtsScore(parseInt(e.target.value, 10))}
                      className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-3"
                    />
                  </div>

                  {/* Min Experience (3 cols) */}
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono mb-1.5 text-gray-400">
                      <span>Min Experience</span>
                      <span className="text-white font-medium">{minExpYears} yrs</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={minExpYears}
                      onChange={(e) => setMinExpYears(parseInt(e.target.value, 10))}
                      className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-3"
                    />
                  </div>

                  {/* Quick toggle of required skills to filter candidate list */}
                  <div className="md:col-span-12 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono mr-2">Filter by skill match:</span>
                    {activeProfile.requiredSkills.map(skill => {
                      const isActive = selectedSkillsFilter.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={`text-xs px-2.5 py-1 rounded-md transition-colors border font-mono ${isActive ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                    {selectedSkillsFilter.length > 0 && (
                      <button 
                        onClick={() => setSelectedSkillsFilter([])}
                        className="text-[10px] text-gray-400 hover:text-white uppercase font-mono border-b border-dashed border-gray-400 ml-auto"
                      >
                        Reset Skills
                      </button>
                    )}
                  </div>

                </div>

                {/* Skills Distribution Chart */}
                <SkillsFrequencyChart 
                  candidates={filteredCandidates}
                  selectedSkillsFilter={selectedSkillsFilter}
                  onToggleSkillFilter={handleToggleChartSkill}
                />

                {/* Main ranking table container */}
                <div className="liquid-glass border border-white/15 rounded-2xl overflow-hidden">
                  
                  {/* Sorting Header Row */}
                  <div className="bg-white/[0.03] px-6 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="text-sm font-medium tracking-tight">
                        Showing {filteredCandidates.length} evaluated candidates
                      </div>
                      <button
                        onClick={handleBulkRejectUnshortlisted}
                        disabled={!candidates.some(c => c.status !== 'Shortlisted' && c.status !== 'Rejected')}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-[11px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer self-start sm:self-center"
                        title="Bulk Reject All Unshortlisted Candidates"
                      >
                        <XCircle size={13} />
                        <span>Bulk Reject All Unshortlisted</span>
                      </button>
                    </div>
                    
                    {/* Sort options */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono">Sort by:</span>
                      <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => {
                            if (sortBy === 'score') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setSortBy('score'); setSortOrder('desc'); }
                          }}
                          className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${sortBy === 'score' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          ATS Score
                        </button>
                        <button
                          onClick={() => {
                            if (sortBy === 'exp') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setSortBy('exp'); setSortOrder('desc'); }
                          }}
                          className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${sortBy === 'exp' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          Experience
                        </button>
                        <button
                          onClick={() => {
                            if (sortBy === 'name') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setSortBy('name'); setSortOrder('asc'); }
                          }}
                          className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${sortBy === 'name' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          Name
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List Body */}
                  <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
                    {filteredCandidates.map((cand, index) => {
                      const isShortlisted = cand.status === 'Shortlisted';
                      const isRejected = cand.status === 'Rejected';
                      
                      // Highlight matching required skills specifically
                      const matchedSkillsList = cand.skills.filter(s => activeProfile.requiredSkills.some(req => req.toLowerCase() === s.toLowerCase()));
                      
                      return (
                        <div 
                          key={cand.id}
                          className={`group p-5 md:p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] ${isShortlisted ? 'bg-white/[0.015]' : ''}`}
                          onClick={() => setSelectedCandidate(cand)}
                        >
                          {/* Rank & Basic Info */}
                          <div className="flex items-start gap-4">
                            {/* Rank index */}
                            <div className="w-8 h-8 rounded-full border border-white/15 bg-zinc-900/80 flex items-center justify-center font-mono text-xs font-semibold text-gray-300">
                              #{index + 1}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-base text-white group-hover:text-white transition-colors">
                                  {cand.name}
                                </h4>
                                {isShortlisted && (
                                  <span className="bg-white text-black font-mono text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                                    TOP Shortlist
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-light mt-0.5">{cand.title} • {cand.location}</p>
                              
                              {/* Display matching skills vs candidate's other skills */}
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {matchedSkillsList.map(s => (
                                  <span key={s} className="bg-white/10 border border-white/20 text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-medium">
                                    {s}
                                  </span>
                                ))}
                                {cand.skills.filter(s => !matchedSkillsList.includes(s)).slice(0, 3).map(s => (
                                  <span key={s} className="bg-transparent border border-white/5 text-gray-400 text-[10px] px-2 py-0.5 rounded-md font-mono font-light">
                                    {s}
                                  </span>
                                ))}
                                {cand.skills.length > matchedSkillsList.length + 3 && (
                                  <span className="text-[10px] text-gray-500 font-mono self-center pl-1">
                                    +{cand.skills.length - matchedSkillsList.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stats and Action Triggers */}
                          <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 pt-3 md:pt-0 md:border-0">
                            
                            {/* Experience stats */}
                            <div className="text-right flex flex-col items-start md:items-end">
                              <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Experience</span>
                              <span className="text-sm font-semibold text-white">{cand.experienceYears} Years</span>
                            </div>

                            {/* ATS Score Indicator */}
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono">ATS Match</span>
                                <span className="block text-lg font-mono font-bold text-white">
                                  {cand.atsScore}%
                                </span>
                              </div>
                              
                              {/* Dynamic SVG radial bar for visual density */}
                              <div className="relative w-10 h-10">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle 
                                    cx="20" cy="20" r="16" 
                                    className="stroke-white/5 fill-transparent" 
                                    strokeWidth="3.5"
                                  />
                                  <circle 
                                    cx="20" cy="20" r="16" 
                                    className="stroke-white fill-transparent transition-all duration-1000" 
                                    strokeWidth="3.5"
                                    strokeDasharray={`${2 * Math.PI * 16}`}
                                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - cand.atsScore / 100)}`}
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-white/40">
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Action toggles (stops propagation so row clicking works) */}
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleUpdateStatus(cand.id, isShortlisted ? 'Unreviewed' : 'Shortlisted')}
                                className={`p-1.5 rounded-lg border transition-all ${isShortlisted ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 hover:border-white text-gray-400 hover:text-white'}`}
                                title={isShortlisted ? 'Remove from Shortlist' : 'Mark as Shortlisted'}
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(cand.id, isRejected ? 'Unreviewed' : 'Rejected')}
                                className={`p-1.5 rounded-lg border transition-all ${isRejected ? 'bg-red-950/20 text-red-400 border-red-500/30' : 'bg-transparent border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400'}`}
                                title={isRejected ? 'Remove rejection status' : 'Mark as Rejected'}
                              >
                                <XCircle size={16} />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}

                    {filteredCandidates.length === 0 && (
                      <div className="p-12 text-center text-gray-500">
                        <HelpCircle size={32} className="mx-auto mb-3 opacity-40 text-white" />
                        <span className="block font-medium">No candidates matched the filtered criteria</span>
                        <span className="text-xs mt-1 block">Try lowering the ATS score threshold or adjusting the experience requirements slider.</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTAINER 2: AUTOMATED RESUME PARSER & SCANNER */}
            {activeTab === 'parser' && (
              <div className="space-y-6">
                
                <div className="liquid-glass border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-white" />
                      <h3 className="font-semibold text-lg tracking-tight">Lexical Resume Parser</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">Real-time skills extraction & indexing</span>
                  </div>

                  <p className="text-xs text-gray-400 font-light mb-6 leading-relaxed">
                    Paste raw resume text below, or test our parsing capabilities with a single click using our preloaded sample profiles. The system will automatically extract job titles, emails, phone numbers, years of experience, and matching technical skills.
                  </p>

                  {/* Preloaded testing profiles */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-5">
                    <span className="text-xs text-gray-400 font-mono">Load test templates:</span>
                    <button 
                      onClick={() => loadSampleResumeText('frontend')}
                      className="bg-white/10 border border-white/10 hover:bg-white/25 text-white text-xs px-3.5 py-1.5 rounded-lg transition-colors font-mono flex items-center gap-1.5"
                    >
                      <Briefcase size={12} /> Sarah Conner (Frontend Engineer)
                    </button>
                    <button 
                      onClick={() => loadSampleResumeText('ai')}
                      className="bg-white/10 border border-white/10 hover:bg-white/25 text-white text-xs px-3.5 py-1.5 rounded-lg transition-colors font-mono flex items-center gap-1.5"
                    >
                      <Sparkles size={12} /> Dr. Alex Mercer (AI/ML Expert)
                    </button>
                  </div>

                  {/* Raw Resume Text area */}
                  <div className="relative mb-5">
                    <textarea
                      value={pastedResumeText}
                      onChange={(e) => setPastedResumeText(e.target.value)}
                      placeholder="Paste the raw text of any resume/CV here (e.g. including profile details, work experience bullet points, skills list, education history)..."
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl p-4 text-xs font-light tracking-wide text-white placeholder-gray-500 h-64 focus:outline-none focus:border-white transition-colors leading-relaxed"
                    />
                    {pastedResumeText && (
                      <button 
                        onClick={() => setPastedResumeText('')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-gray-500 font-mono">
                      *Parsed candidates will instantly be added and scored against the active Job Profile.
                    </span>
                    <button
                      onClick={handleRunResumeParser}
                      disabled={!pastedResumeText.trim() || isParsing}
                      className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        !pastedResumeText.trim() || isParsing
                          ? 'bg-zinc-800 text-gray-500 cursor-not-allowed border border-white/5'
                          : 'bg-white text-black hover:bg-gray-100 cursor-pointer shadow-sm'
                      }`}
                    >
                      {isParsing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>{parsingProgress}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Run Lexical Parser</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTAINER 3: SHORTLIST & EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                
                {/* Shortlist overview stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Export Options */}
                  <div className="liquid-glass border border-white/20 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Download size={18} className="text-white" />
                        <h3 className="font-semibold text-lg tracking-tight">Export Shortlisted Candidates</h3>
                      </div>
                      <p className="text-xs text-gray-400 font-light mb-6 leading-relaxed">
                        Export your current curated shortlist of top talent to standard business formats. These exports include contact information, overall ATS score evaluations, and structured skill listings.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2 mb-2 font-mono">
                        <span>Total Shortlisted to Export:</span>
                        <span className="text-white font-semibold font-sans">{sortedExportPool.length} Profiles</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleExportData('csv')}
                          disabled={sortedExportPool.length === 0}
                          className="w-full bg-white text-black font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <Download size={14} />
                          <span>Export as CSV</span>
                        </button>
                        <button
                          onClick={() => handleExportData('json')}
                          disabled={sortedExportPool.length === 0}
                          className="w-full bg-zinc-900 border border-white/10 hover:border-white/20 text-white font-medium text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                          <FileText size={14} />
                          <span>Export as JSON</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Batch JSON Pool Importer */}
                  <div className="liquid-glass border border-white/20 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Upload size={18} className="text-white" />
                          <h3 className="font-semibold text-lg tracking-tight">Batch Importer</h3>
                        </div>
                        <span className="text-[10px] bg-white/15 border border-white/10 text-white font-mono px-2 py-0.5 rounded">
                          Candidate JSON Schema
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-light mb-4 leading-relaxed">
                        Import multiple candidates at once by uploading a <strong>.json</strong> file containing a candidate array, or pasting a JSON pool array below.
                      </p>
                    </div>

                    {/* Interactive File Dropzone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-white bg-white/10 scale-[0.98]' 
                          : 'border-white/15 hover:border-white/40 hover:bg-white/[0.02]'
                      }`}
                    >
                      <Upload className="mx-auto mb-2 text-white/80" size={24} />
                      <span className="block text-xs font-semibold text-white">Drag & drop candidates.json here</span>
                      <span className="block text-[10px] text-gray-400 mt-1">or click to browse local files</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={copySampleJsonToClipboard}
                        className="w-full bg-zinc-900 border border-white/10 hover:border-white/20 text-xs text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copiedSampleJson ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        <span>{copiedSampleJson ? 'Template Copied!' : 'Copy Sample Candidate Schema'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Import Text Box */}
                <div className="liquid-glass border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">Paste JSON Array of Candidates</span>
                    {importSuccess && (
                      <span className="text-xs text-green-400 font-mono font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Candidates successfully imported & evaluation scores generated!
                      </span>
                    )}
                  </div>
                  
                  <textarea
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder={`Paste candidate list JSON array e.g.\n[\n  {\n    "name": "Alex Johnson",\n    "skills": ["React", "TypeScript"],\n    "experienceYears": 5\n  }\n]`}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-white placeholder-gray-600 h-48 focus:outline-none focus:border-white transition-colors leading-relaxed"
                  />

                  {importError && (
                    <div className="mt-3 text-xs text-red-400 font-mono bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg">
                      Error: {importError}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleImportJson}
                      disabled={!importJsonText.trim()}
                      className={`px-5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                        !importJsonText.trim()
                          ? 'bg-zinc-850 text-gray-500 cursor-not-allowed border border-white/5'
                          : 'bg-white text-black hover:bg-gray-100 cursor-pointer shadow-sm'
                      }`}
                    >
                      Import Candidate Pool
                    </button>
                  </div>
                </div>

                {/* Curated list preview of current shortlists */}
                <div className="liquid-glass border border-white/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <span className="font-semibold text-base">Curated Shortlist Evaluation ({sortedExportPool.length} Profiles)</span>
                    <span className="text-xs text-gray-400 font-mono">Current target: top {shortlistCount}</span>
                  </div>

                  <div className="space-y-3">
                    {sortedExportPool.map((cand, idx) => (
                      <div key={cand.id} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-gray-400">#{idx + 1}</span>
                          <div>
                            <span className="font-medium block text-sm">{cand.name}</span>
                            <span className="text-xs text-gray-400 font-light">{cand.title} • {cand.experienceYears} Years Exp</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="bg-white/10 text-white font-mono text-xs px-2.5 py-1 rounded-md border border-white/10 font-bold">
                            ATS {cand.atsScore}%
                          </span>
                          <button 
                            onClick={() => handleUpdateStatus(cand.id, 'Unreviewed')}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Remove from Shortlist"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {sortedExportPool.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No candidates are currently available. Please add or import some candidates first!
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ================= INTERACTIVE CANDIDATE DETAIL DRAWER MODAL ================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 w-full max-w-3xl rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            
            {/* Header / Basic controls */}
            <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white/10 text-white text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border border-white/10">
                  Profile Assessment
                </span>
                <span className="text-xs text-gray-400">ID: {selectedCandidate.id}</span>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content box */}
            <div className="p-6 space-y-6">
              
              {/* Profile intro card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{selectedCandidate.name}</h3>
                  <p className="text-sm text-gray-300 font-light mt-0.5">{selectedCandidate.title}</p>
                  
                  {/* Contact info list */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-gray-400 font-light">
                    <span className="flex items-center gap-1.5"><Mail size={12} className="text-white/60" /> {selectedCandidate.email}</span>
                    <span className="flex items-center gap-1.5"><Phone size={12} className="text-white/60" /> {selectedCandidate.phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-white/60" /> {selectedCandidate.location}</span>
                  </div>
                </div>

                {/* Score badge big */}
                <div className="flex items-center gap-3 self-start md:self-center">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono">ATS Match rating</span>
                    <span className="block text-3xl font-mono font-black text-white">{selectedCandidate.atsScore}%</span>
                  </div>
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="22" className="stroke-white/5 fill-transparent" strokeWidth="4.5" />
                      <circle 
                        cx="28" cy="28" r="22" 
                        className="stroke-white fill-transparent transition-all duration-1000" 
                        strokeWidth="4.5"
                        strokeDasharray={`${2 * Math.PI * 22}`}
                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - selectedCandidate.atsScore / 100)}`}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status control selectors */}
              <div className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl p-3.5">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Current Evaluation Status:</span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'Unreviewed')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selectedCandidate.status === 'Unreviewed' ? 'bg-white text-black border-white font-medium' : 'bg-transparent border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    Unreviewed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'Shortlisted')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${selectedCandidate.status === 'Shortlisted' ? 'bg-white text-black border-white font-medium' : 'bg-transparent border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    <CheckCircle2 size={12} />
                    <span>Shortlisted</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'Rejected')}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${selectedCandidate.status === 'Rejected' ? 'bg-red-950 text-red-400 border-red-500/20 font-medium' : 'bg-transparent border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    <XCircle size={12} />
                    <span>Rejected</span>
                  </button>
                </div>
              </div>

              {/* Match Analysis Details */}
              <div className="liquid-glass border border-white/15 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles size={16} className="text-white" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white">ATS Automated Fit Assessment</span>
                </div>
                <p className="text-sm font-light text-gray-200 leading-relaxed">
                  {selectedCandidate.matchAnalysis}
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-1">Academic Education</span>
                    <span className="text-xs text-white flex items-center gap-1.5 font-light">
                      <GraduationCap size={13} className="text-white/60" /> {selectedCandidate.education}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-1">Acquired Technical Skills</span>
                    <span className="text-xs text-white flex items-center gap-1.5 font-light">
                      <Award size={13} className="text-white/60" /> {selectedCandidate.skills.length} skills listed
                    </span>
                  </div>
                </div>
              </div>

              {/* Tag listings categorized */}
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono mb-2">Detailed Skill Intersect Matrix</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map(s => {
                    const isRequired = activeProfile.requiredSkills.some(req => req.toLowerCase() === s.toLowerCase());
                    const isPreferred = activeProfile.preferredSkills.some(pref => pref.toLowerCase() === s.toLowerCase());
                    
                    let bgStyle = 'bg-transparent border-white/5 text-gray-400';
                    let label = '';
                    
                    if (isRequired) {
                      bgStyle = 'bg-white text-black font-semibold border-white';
                      label = ' [Required]';
                    } else if (isPreferred) {
                      bgStyle = 'bg-white/15 text-white border-white/30';
                      label = ' [Preferred]';
                    }

                    return (
                      <span 
                        key={s} 
                        className={`text-xs px-2.5 py-1 rounded-md border font-mono flex items-center gap-1 select-none ${bgStyle}`}
                      >
                        {s}{label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Full Original Resume text view */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-mono">Original Resume Layout Text</span>
                  <span className="text-[10px] text-gray-500 font-mono">Read-only view</span>
                </div>
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 h-48 overflow-y-auto">
                  <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedCandidate.resumeText || `No raw resume text loaded for ${selectedCandidate.name}.`}
                  </pre>
                </div>
              </div>

            </div>

            {/* Bottom action bar */}
            <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-sm z-10 px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 border border-white/10 hover:border-white/30 text-white rounded-lg text-sm transition-all"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= SLIDE-OUT VEX AI CAREER CONSULTANT ASSISTANT ================= */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-zinc-950 border-l border-white/10 z-50 transform transition-transform duration-300 shadow-2xl flex flex-col justify-between ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <div>
              <h4 className="font-semibold text-sm tracking-tight text-white">VEX AI Recruiter Agent</h4>
              <span className="text-[10px] text-gray-400 font-mono">Always Online</span>
            </div>
          </div>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Chat Messages Panel */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/40">
          {chatMessages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-white text-black font-medium rounded-tr-none' 
                    : 'bg-zinc-900 border border-white/10 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-500 font-mono mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat suggestions triggers */}
        <div className="px-5 py-2.5 bg-zinc-950 border-t border-white/5 flex flex-wrap gap-1.5">
          <button 
            onClick={() => setChatInput('Who is the best match?')}
            className="text-[10px] bg-white/5 border border-white/10 hover:bg-white/15 px-2 py-1 rounded-md text-gray-300 font-mono"
          >
            Who is the best match?
          </button>
          <button 
            onClick={() => setChatInput('How do I export raw data?')}
            className="text-[10px] bg-white/5 border border-white/10 hover:bg-white/15 px-2 py-1 rounded-md text-gray-300 font-mono"
          >
            How do I export?
          </button>
          <button 
            onClick={() => setChatInput('Tell me about Eleanor Vance')}
            className="text-[10px] bg-white/5 border border-white/10 hover:bg-white/15 px-2 py-1 rounded-md text-gray-300 font-mono"
          >
            Review Eleanor Vance
          </button>
        </div>

        {/* Chat Input panel */}
        <div className="p-4 bg-zinc-900 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendChatMessage();
            }}
            placeholder="Type a query (e.g. Eleanor Vance)..."
            className="flex-1 bg-zinc-950 border border-white/10 text-xs text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-white transition-colors placeholder-gray-500"
          />
          <button
            onClick={handleSendChatMessage}
            disabled={!chatInput.trim()}
            className="bg-white hover:bg-gray-100 disabled:opacity-40 text-black px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}
