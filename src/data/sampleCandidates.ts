import { Candidate, JobProfile } from '../types';

export const DEFAULT_JOB_PROFILES: JobProfile[] = [
  {
    id: 'jp-1',
    title: 'Senior Frontend Engineer (React & Tailwind)',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'CSS'],
    preferredSkills: ['Framer Motion', 'GraphQL', 'Redux', 'Vite', 'Jest'],
    minExperienceYears: 5,
    description: 'We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for crafting high-fidelity user experiences using React, TypeScript, and Tailwind CSS. Experience with motion layout design and modern performance optimization is highly desired.'
  },
  {
    id: 'jp-2',
    title: 'Senior Backend Engineer (Node & PostgreSQL)',
    requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'REST APIs'],
    preferredSkills: ['Redis', 'Docker', 'AWS', 'GraphQL', 'Drizzle ORM'],
    minExperienceYears: 6,
    description: 'Seeking an expert Backend Engineer with strong expertise in building scalable APIs and complex backend services in Node.js and TypeScript. You will optimize database queries in PostgreSQL, orchestrate Docker containers, and lead cloud deployments.'
  },
  {
    id: 'jp-3',
    title: 'Full Stack Developer',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'Express', 'SQL'],
    preferredSkills: ['Tailwind CSS', 'PostgreSQL', 'Git', 'CI/CD', 'Docker'],
    minExperienceYears: 3,
    description: 'Looking for a well-rounded Full Stack Developer capable of owning end-to-end features. You will build user-facing components in React and connect them seamlessly with Node.js REST services and SQL databases.'
  },
  {
    id: 'jp-4',
    title: 'AI / Machine Learning Engineer',
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'NLP'],
    preferredSkills: ['LLMs', 'Gemini API', 'Scikit-Learn', 'Vector Databases', 'Docker'],
    minExperienceYears: 4,
    description: 'We are expanding our AI Capabilities division. You will build, train, and fine-tune machine learning and natural language processing models, as well as integrate large language models (LLMs) like Gemini into client solutions.'
  },
  {
    id: 'jp-5',
    title: 'Technical Product Manager',
    requiredSkills: ['Product Strategy', 'Agile', 'Scrum', 'SaaS', 'Roadmapping'],
    preferredSkills: ['UX/UI Design', 'SQL', 'A/B Testing', 'Product Analytics', 'Jira'],
    minExperienceYears: 4,
    description: 'Looking for a Technical Product Manager who can act as the bridge between business strategy and execution. You will draft technical specifications, manage sprint backlogs, define long-term product roadmaps, and analyze core user metrics.'
  }
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    title: 'Senior Frontend Engineer',
    experienceYears: 7,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'CSS', 'Redux', 'Vite', 'Framer Motion', 'Webpack'],
    education: 'M.S. in Computer Science — Stanford University',
    atsScore: 98,
    status: 'Unreviewed',
    matchAnalysis: 'Outstanding skill overlap. Eleanor possesses all core requested skills including React, TypeScript, Next.js, and Tailwind CSS. Strong seniority with 7 years of experience.',
    resumeText: `ELEANOR VANCE
San Francisco, CA | eleanor.vance@example.com | +1 (555) 234-5678

PROFESSIONAL SUMMARY
Senior Frontend Engineer with 7+ years of experience specializing in building highly performant, accessible, and delightful user interfaces. Expert in React, TypeScript, Next.js, and Tailwind CSS. Proven track record of spearheading design systems and boosting web application core web vitals by up to 40%.

CORE SKILLS
- Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
- Frameworks & Libraries: React, Next.js, Redux Toolkit, Framer Motion, Tailwind CSS, Sass
- Tools & Bundlers: Vite, Webpack, Git, Docker, Jest, Cypress

WORK EXPERIENCE
Lead Frontend Engineer | Velo Tech (2022 - Present)
- Architected and built the next-generation SaaS dashboard using React 18, TypeScript, and Tailwind CSS, increasing user retention by 22%.
- Developed a high-performance animations system using Framer Motion (motion) to deliver fluid, physics-based UI transitions.
- Mentored 5 junior and mid-level engineers, enforcing modern code styling, test-driven development, and modular architecture.

Senior UI Developer | PixelCraft Studio (2019 - 2022)
- Re-architected an aging legacy web application into a clean, modern Next.js workspace, reducing page load times by 1.8 seconds.
- Crafted a modular, responsive internal component library styled exclusively with Tailwind CSS utility classes.`
  },
  {
    id: 'cand-2',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@example.com',
    phone: '+1 (555) 876-5432',
    location: 'Seattle, WA',
    title: 'Senior Backend Architect',
    experienceYears: 8,
    skills: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Docker', 'Redis', 'AWS', 'GraphQL'],
    education: 'B.S. in Software Engineering — University of Washington',
    atsScore: 95,
    status: 'Unreviewed',
    matchAnalysis: 'Excellent match for Backend Architect roles. Marcus has robust database optimization skills, extensive cloud deployment records, and strong Node.js experience.',
    resumeText: `MARCUS STERLING
Seattle, WA | marcus.sterling@example.com | +1 (555) 876-5432

PROFESSIONAL SUMMARY
Robust Backend Engineer with 8 years of professional experience designing microservices, optimizing SQL queries, and maintaining cloud architecture on AWS. Deeply proficient in Node.js, Express, PostgreSQL, TypeScript, and containerization.

CORE SKILLS
- Backend: Node.js, Express, NestJS, Go, Python, REST APIs, gRPC, GraphQL
- Databases: PostgreSQL, MongoDB, Redis, Drizzle ORM, Prisma
- Infrastructure: AWS (S3, EC2, ECS, Lambda), Docker, Kubernetes, CI/CD (GitHub Actions)

WORK EXPERIENCE
Senior Backend Engineer | CloudBase Systems (2021 - Present)
- Designed and built a real-time transactional pipeline in Node.js and TypeScript handling over 10 million daily API requests.
- Optimized legacy PostgreSQL database schemas and implemented Redis caching, reducing database read latency by 65%.
- Established robust CI/CD deployment pipelines using Docker, Kubernetes, and AWS ECS.

Backend Developer | Apex Logistics (2018 - 2021)
- Developed and maintained Node.js REST APIs for supply chain tracking, ensuring high security and 99.99% uptime.
- Transitioned a monolith application to a modular TypeScript microservices structure.`
  },
  {
    id: 'cand-3',
    name: 'Siddharth Nair',
    email: 'siddharth.n@example.com',
    phone: '+1 (555) 432-1098',
    location: 'Austin, TX',
    title: 'Full Stack Developer',
    experienceYears: 4,
    skills: ['React', 'Node.js', 'TypeScript', 'Express', 'SQL', 'Tailwind CSS', 'PostgreSQL', 'Git', 'MongoDB'],
    education: 'B.S. in Computer Science — UT Austin',
    atsScore: 89,
    status: 'Unreviewed',
    matchAnalysis: 'Siddharth meets all the baseline requirements for a Full Stack Developer. Strong React/Node combo, plus good experience with SQL databases and Tailwind.',
    resumeText: `SIDDHARTH NAIR
Austin, TX | siddharth.n@example.com | +1 (555) 432-1098

PROFESSIONAL SUMMARY
Adaptable Full Stack Developer with 4 years of experience writing clean, scalable JavaScript and TypeScript across the entire application stack. Proficient in crafting responsive frontends in React and robust backends in Node.js and Express.

CORE SKILLS
- Frontend: React, Redux, Tailwind CSS, HTML5, CSS3, JavaScript
- Backend: Node.js, Express, RESTful APIs, GraphQL
- Databases: SQL, PostgreSQL, MongoDB

WORK EXPERIENCE
Full Stack Engineer | Synergy Apps (2022 - Present)
- Owned the end-to-end development of the customer portal, leveraging React on the client and Express/Node.js on the server.
- Styled user-facing elements using Tailwind CSS for full responsive alignment across desktop, tablet, and mobile browsers.
- Wrote raw SQL queries and configured relational database schemas in PostgreSQL to persist customer transaction history.

Software Engineer | DevGroup Texas (2020 - 2022)
- Maintained a suite of internal React tools, fixing bugs, refactoring legacy components, and migrating APIs to TypeScript.`
  },
  {
    id: 'cand-4',
    name: 'Clarissa Zhao',
    email: 'clarissa.zhao@example.com',
    phone: '+1 (555) 654-9870',
    location: 'Boston, MA',
    title: 'AI Researcher & Engineer',
    experienceYears: 5,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'NLP', 'LLMs', 'Gemini API', 'Scikit-Learn', 'Vector Databases'],
    education: 'Ph.D. in Artificial Intelligence — MIT',
    atsScore: 97,
    status: 'Unreviewed',
    matchAnalysis: 'Highly impressive ML/NLP specialist. Doctor of Philosophy in AI from MIT. Extensive knowledge of LLMs, Python, PyTorch, and NLP models.',
    resumeText: `CLARISSA ZHAO
Boston, MA | clarissa.zhao@example.com | +1 (555) 654-9870

PROFESSIONAL SUMMARY
Research Scientist & AI Engineer with 5 years of post-graduate experience developing state-of-the-art NLP models and deep learning frameworks. Expert in Python, PyTorch, and TensorFlow. Highly experienced in training transformers and integrating advanced LLMs via APIs (like Gemini).

CORE SKILLS
- Languages: Python, C++, SQL, R
- ML Libraries: PyTorch, TensorFlow, Scikit-Learn, Hugging Face Transformers
- Domains: Natural Language Processing (NLP), LLM Fine-tuning, Semantic Search, Vector DBs

WORK EXPERIENCE
Lead AI Engineer | SynthAI Research (2022 - Present)
- Engineered a generative text summarizer pipeline using huggingface models, optimized with PyTorch, cutting processing costs by 35%.
- Built search and retrieval augmented generation (RAG) agents utilizing vector databases and Google Gemini API for advanced semantic routing.
- Authored 3 papers on efficient fine-tuning parameters for language models in production environments.

Machine Learning Developer | Cognition Labs (2021 - 2022)
- Trained classification and entity recognition models in Python using TensorFlow, achieving 94% precision across large structured datasets.`
  },
  {
    id: 'cand-5',
    name: 'Aiden Gallagher',
    email: 'aiden.g@example.com',
    phone: '+1 (555) 789-0123',
    location: 'New York, NY',
    title: 'Technical Product Manager',
    experienceYears: 6,
    skills: ['Product Strategy', 'Agile', 'Scrum', 'SaaS', 'Roadmapping', 'Jira', 'UX/UI Design', 'Product Analytics', 'SQL'],
    education: 'B.A. in Economics & Computer Science — Columbia University',
    atsScore: 92,
    status: 'Unreviewed',
    matchAnalysis: 'Aiden represents a highly competent Product Manager with deep technical grounding, clear sprint management experience, and excellent metrics analytical skills.',
    resumeText: `AIDEN GALLAGHER
New York, NY | aiden.g@example.com | +1 (555) 789-0123

PROFESSIONAL SUMMARY
Technical Product Manager with 6 years of experience steering SaaS product strategies from inception to release. Strong background in software engineering, enabling deep alignment with engineering squads. Certified Scrum Product Owner (CSPO).

CORE SKILLS
- Methodology: Agile, Scrum, Kanban, Lean Startup
- Management Tools: Jira, Confluence, Linear, Notion, Productboard
- Analytics & Technical: Amplitude, Mixpanel, SQL, Figma, User Research

WORK EXPERIENCE
Senior Product Manager | FinLink Group (2021 - Present)
- Led a cross-functional squad of 12 engineers and designers, launching a new corporate payments dashboard that drove $4M ARR in year one.
- Created technical specifications, prioritized backlog items, and led daily stand-ups and agile retrospectives.
- Executed rigorous product analytics using SQL queries and Amplitude to identify drop-off funnels, increasing conversion by 18%.

Technical PM | CoreCart SaaS (2018 - 2021)
- Managed the API integrations roadmap, successfully coordinating third-party connections with Stripe, Twilio, and Salesforce.`
  },
  {
    id: 'cand-6',
    name: 'Maya Patel',
    email: 'maya.patel@example.com',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    title: 'Frontend Developer',
    experienceYears: 3,
    skills: ['React', 'TypeScript', 'CSS', 'Tailwind CSS', 'Redux', 'JavaScript', 'Git'],
    education: 'B.S. in Information Systems — DePaul University',
    atsScore: 82,
    status: 'Unreviewed',
    matchAnalysis: 'Solid mid-level Frontend engineer. Maya has strong fundamental React and Tailwind skills, although her years of experience (3) are slightly below the senior requirement (5).',
    resumeText: `MAYA PATEL
Chicago, IL | maya.patel@example.com | +1 (555) 345-6789

PROFESSIONAL SUMMARY
User-focused Frontend Developer with 3 years of experience building responsive, interactive single-page web applications. Deeply familiar with React, modern JavaScript/TypeScript state management, and semantic HTML/CSS styled with Tailwind.

CORE SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML, CSS
- Libraries: React, Redux, React Router, Vite, Tailwind CSS
- Tooling: Git, npm, Postman, Chrome DevTools

WORK EXPERIENCE
Software Engineer (Frontend) | Apex Digital (2022 - Present)
- Coded and shipped the redesigned client onboarding flow using React, state hooks, and Tailwind CSS, increasing sign-ups by 14%.
- Worked closely with UX designers to translate Figma design mockups into responsive, pixel-perfect layouts.
- Integrated third-party RESTful APIs, managing clean loading states and asynchronous data caching.`
  },
  {
    id: 'cand-7',
    name: 'Liam Vance',
    email: 'liam.vance@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Denver, CO',
    title: 'Full Stack Engineer',
    experienceYears: 5,
    skills: ['React', 'Node.js', 'TypeScript', 'Express', 'SQL', 'PostgreSQL', 'Git', 'Docker', 'Tailwind CSS'],
    education: 'B.S. in Computer Science — University of Colorado',
    atsScore: 91,
    status: 'Unreviewed',
    matchAnalysis: 'Great fit for the Full Stack Developer role. Perfect experience years (5), meets required skills (React, Node, TypeScript, SQL, Express), and has good extra qualifications.',
    resumeText: `LIAM VANCE
Denver, CO | liam.vance@example.com | +1 (555) 123-4567

PROFESSIONAL SUMMARY
Versatile Full Stack Engineer with 5 years of experience developing stable backends and responsive frontends. Highly competent in Node.js, Express, React, PostgreSQL, and TypeScript. Efficient debugger with strong unit testing standards.

CORE SKILLS
- Frontend: React, Redux, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express, TypeScript, REST APIs
- DB & Ops: PostgreSQL, SQLite, Git, Docker, GitHub Actions, Jest

WORK EXPERIENCE
Full Stack Developer | Rocky Mountain Tech (2021 - Present)
- Led the backend restructuring of our inventory tool, migrating legacy code to Node.js/TypeScript and PostgreSQL.
- Implemented robust user authentication and session management protocols.
- Authored over 150 unit and integration tests using Jest, achieving 90%+ code coverage.`
  },
  {
    id: 'cand-8',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@example.com',
    phone: '+1 (555) 901-2345',
    location: 'Miami, FL',
    title: 'Data & ML Specialist',
    experienceYears: 3,
    skills: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'Scikit-Learn', 'SQL', 'Tableau'],
    education: 'M.S. in Business Analytics — University of Miami',
    atsScore: 78,
    status: 'Unreviewed',
    matchAnalysis: 'Sofia has robust baseline ML/Python training, but lacks some advanced required frameworks (like PyTorch) and has limited engineering experience compared to senior ML profiles.',
    resumeText: `SOFIA RODRIGUEZ
Miami, FL | sofia.r@example.com | +1 (555) 901-2345

PROFESSIONAL SUMMARY
Data Analyst & Machine Learning Engineer with 3 years of experience extracting data insights and deploying predictive models. Proficient in Python, SQL, and Scikit-Learn. Skilled at communicating complex technical findings to business leaders.

CORE SKILLS
- Programming & Analysis: Python (Pandas, NumPy, Scikit-Learn), SQL, R, Tableau
- Machine Learning: Regression, Classification, K-Means Clustering, basic NLP
- Tools: Jupyter, Git, VS Code, Airflow

WORK EXPERIENCE
Data Scientist | Coral Reef Analytics (2022 - Present)
- Built classification models in Python to predict client churn, improving targeted outreach efficiency by 25%.
- Designed and maintained clean dashboard visualizers in Tableau for monthly performance indicators.
- Managed automated data extraction pipelines using SQL queries and Airflow tasks.`
  }
];

const firstNames = [
  'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'William', 'Sophia', 'Mason', 'Isabella', 'James',
  'Mia', 'Benjamin', 'Charlotte', 'Jacob', 'Abigail', 'Michael', 'Emily', 'Elijah', 'Harper', 'Ethan',
  'Amelia', 'Alexander', 'Evelyn', 'Oliver', 'Elizabeth', 'Daniel', 'Sofia', 'Lucas', 'Madison', 'Matthew',
  'Avery', 'Jackson', 'Ella', 'David', 'Scarlett', 'Joseph', 'Chloe', 'Carter', 'Victoria', 'Owen',
  'Grace', 'Wyatt', 'Zoey', 'John', 'Penelope', 'Jack', 'Lillian', 'Luke', 'Aubrey', 'Henry'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Chicago, IL',
  'Denver, CO', 'Miami, FL', 'Los Angeles, CA', 'Atlanta, GA', 'Portland, OR', 'Salt Lake City, UT',
  'Remote, USA', 'Dallas, TX', 'San Diego, CA'
];

const educations = [
  'B.S. in Computer Science — Stanford University',
  'M.S. in Software Engineering — MIT',
  'B.S. in Computer Science — UC Berkeley',
  'M.S. in Data Science — Columbia University',
  'B.S. in Information Systems — University of Washington',
  'B.S. in Computer Engineering — UT Austin',
  'Ph.D. in Artificial Intelligence — Georgia Tech',
  'M.S. in Computer Science — Carnegie Mellon University',
  'B.S. in Web Development — NYU',
  'B.S. in Computer Science — Harvard University'
];

const profilesPool = [
  {
    title: 'Senior Frontend Engineer',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'CSS', 'Redux', 'Vite', 'Framer Motion', 'Webpack'],
    experienceRange: [5, 12]
  },
  {
    title: 'Senior Backend Architect',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'REST APIs', 'Docker', 'Redis', 'AWS', 'GraphQL'],
    experienceRange: [6, 15]
  },
  {
    title: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'TypeScript', 'Express', 'SQL', 'Tailwind CSS', 'PostgreSQL', 'Git', 'Docker', 'MongoDB'],
    experienceRange: [3, 8]
  },
  {
    title: 'AI / Machine Learning Engineer',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'NLP', 'LLMs', 'Gemini API', 'Scikit-Learn', 'Vector Databases'],
    experienceRange: [4, 10]
  },
  {
    title: 'Technical Product Manager',
    skills: ['Product Strategy', 'Agile', 'Scrum', 'SaaS', 'Roadmapping', 'UX/UI Design', 'SQL', 'A/B Testing', 'Product Analytics', 'Jira'],
    experienceRange: [4, 12]
  }
];

function generateExtraCandidates(): Candidate[] {
  const extra: Candidate[] = [];
  
  for (let i = 0; i < 120; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i + 7) % lastNames.length];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`;
    const phone = `+1 (555) ${100 + (i % 900)}-${2000 + i}`;
    const location = locations[i % locations.length];
    
    const profile = profilesPool[i % profilesPool.length];
    const minExp = profile.experienceRange[0];
    const maxExp = profile.experienceRange[1];
    const experienceYears = minExp + (i % (maxExp - minExp + 1));
    
    // Pick 5-8 random skills from profile skills
    const numSkills = 5 + (i % 4);
    const profileSkills = [...profile.skills];
    const shuffledSkills = profileSkills.sort(() => 0.5 - Math.random());
    const candidateSkills = shuffledSkills.slice(0, numSkills);
    
    // Add 1-2 generic extra skills
    if (i % 2 === 0) candidateSkills.push('Git');
    if (i % 3 === 0) candidateSkills.push('SQL');
    
    const education = educations[i % educations.length];
    const title = profile.title;
    
    extra.push({
      id: `cand-${9 + i}`,
      name,
      email,
      phone,
      location,
      title,
      experienceYears,
      skills: Array.from(new Set(candidateSkills)), // ensure unique skills
      education,
      atsScore: 0,
      status: 'Unreviewed',
      matchAnalysis: '',
      resumeText: `${name.toUpperCase()}\n${location} | ${email} | ${phone}\n\nSUMMARY\nHighly competent ${title} with ${experienceYears} years of hands-on industry experience specializing in ${candidateSkills.slice(0, 3).join(', ')}. Proven history of delivering high impact solutions in modern workflows.\n\nCORE SKILLS\n${candidateSkills.join(', ')}\n\nEDUCATION\n${education}`
    });
  }
  
  return extra;
}

export const SAMPLE_CANDIDATES: Candidate[] = [
  ...INITIAL_CANDIDATES,
  ...generateExtraCandidates()
];
