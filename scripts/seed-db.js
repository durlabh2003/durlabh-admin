import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fbqzbshashzkebvucejg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXpic2hhc2h6a2VidnVjZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMDMzMzMsImV4cCI6MjEwMDU3OTMzM30.VWajPp5hCWunobxcNE3g8ELYYL6hJd0Lx5cxDPPiamg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const profile = {
  name: "Durlabh Daryani",
  role: "AI Product Manager",
  tagline: "Building and shipping real products before my first PM role.",
  location: "Jaipur, Rajasthan, India",
  coords: "JPR // 26.9124° N",
  email: "durlabh.daryani@gmail.com",
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com/in/durlabhdaryani" },
    { label: "Twitter", href: "https://twitter.com/durlabhdaryani" },
    { label: "GitHub", href: "https://github.com/durlabhdaryani" },
  ],
};

const about = {
  paragraphs: [
    "I've built and shipped four products end-to-end — Kartify, CafeOS, Tapinfi and FinMate — before ever holding a Product Manager title. Each one ran through the full product loop: customer discovery, JTBD framing, prioritization, scoping, shipping, and post-launch measurement. The craft is already the work I do.",
    "My BA and QA background is not a side story — it's the same PM work under a different job title. Requirements gathering, acceptance criteria, stakeholder negotiation, bug triage and release validation are exactly what Product Managers do before a feature gets written. The self-initiated products are even stronger evidence: nobody assigned them, nobody paid me for them, and I still chose the problems, ran the research and shipped the builds. That kind of unprompted judgment is harder to teach than a title.",
    "I want to be one of the leading AI Product Managers of the next decade. Not for the title — because the products that matter will be the ones that explain their reasoning, not just their output, and that's the same principle I designed into Kartify. That's the trajectory I'm on.",
  ],
  stats: [
    { label: "Products Shipped", value: 4, suffix: "" },
    { label: "Case Studies", value: 6, suffix: "" },
    { label: "Frameworks Practiced", value: 5, suffix: "+" },
    { label: "AI Experiments", value: 20, suffix: "+" },
  ],
};

const featuredProducts = [
  {
    index: "01",
    kicker: "AI SHOPPING",
    name: "Kartify",
    role: "PM · UX · AI Workflow",
    status: "shipped",
    description: "Conversational AI shopping assistant that researches products, compares options and recommends the best fit.",
    longDescription: "Kartify replaces 20 open tabs with one conversation. It asks clarifying questions, remembers your preferences, compares options in structured tables, and explains the reasoning behind every recommendation.",
    stack: ["Next.js", "Gemini", "Supabase", "n8n"],
    liveUrl: "https://kartify.ai",
    prdUrl: "https://kartify.ai/prd",
    linksLive: false,
    accent: "from-emerald-400/30 to-emerald-900/10",
  },
  {
    index: "02",
    kicker: "RESTAURANT SaaS",
    name: "CafeOS",
    role: "Product Owner",
    status: "shipped",
    description: "Operating system for cafes — QR ordering, KDS, billing, CRM, inventory and loyalty in one workflow.",
    longDescription: "CafeOS collapses 4–6 disconnected tools into one operator dashboard. In a 3-cafe pilot, operators self-reported ~31% shorter kitchen ticket times and ~42% fewer order errors in the first month.",
    stack: ["React", "Node", "MongoDB"],
    liveUrl: "https://cafeos.app",
    prdUrl: "https://cafeos.app/prd",
    linksLive: false,
    accent: "from-lime-400/30 to-lime-900/10",
  },
  {
    index: "03",
    kicker: "AI FINTECH",
    name: "FinMate",
    role: "Founding PM",
    status: "shipped",
    description: "Gen-Z focused AI financial assistant for budgeting, saving and building healthy money habits.",
    longDescription: "FinMate reframes personal finance from guilt to guidance. A weekly financial health score, plain-language coaching, and zero manual entry keep users engaged past week one.",
    stack: ["LLM", "Firebase", "React"],
    liveUrl: "https://finmate.app",
    prdUrl: "https://finmate.app/prd",
    linksLive: false,
    accent: "from-teal-400/30 to-teal-900/10",
  },
  {
    index: "04",
    kicker: "SaaS · FOUNDER",
    name: "Tapinfi",
    role: "Founder",
    status: "shipped",
    description: "NFC-enabled digital business card platform with dynamic profiles, analytics and lead capture.",
    longDescription: "Tapinfi turns a business card into a memory hook. NFC + QR sharing, themed dynamic profiles, lead capture and CRM export — onboarding to first share in under 90 seconds.",
    stack: ["Next.js", "Supabase", "NFC"],
    liveUrl: "https://tapinfi.com",
    prdUrl: "https://tapinfi.com/prd",
    linksLive: false,
    accent: "from-cyan-400/30 to-cyan-900/10",
  },
];

const caseStudies = [
  {
    slug: "kartify",
    name: "Kartify",
    tag: "AI Shopping Assistant",
    status: "shipped",
    problem: "Shoppers waste hours comparing products across marketplaces with inconsistent specs, reviews and pricing.",
    research: "12 user interviews across three shopping personas; competitive teardown of Amazon, Perplexity Shopping and Google Shopping.",
    jtbd: "When I'm buying a considered product, I want a trusted advisor that asks the right questions, so I can decide confidently without opening 20 tabs.",
    prd: "Conversational search with clarifying follow-ups, memory of preferences, structured comparison and a recommendation with reasoning.",
    metrics: [
      "MVP shipped in 6 weeks",
      "Task-completion ~78% in an internal usability test (n=9, self-run)",
      "Avg. session depth ~6.4 turns in the same test",
    ],
    lessons: "Trust comes from showing reasoning, not just the answer. Comparison tables converted better than prose recommendations. Used JTBD to reframe the search box as a conversation.",
  },
  {
    slug: "cafeos",
    name: "CafeOS",
    tag: "Restaurant SaaS",
    status: "shipped",
    problem: "Independent cafes juggle 4–6 disconnected tools for ordering, billing, inventory and loyalty — losing revenue to friction.",
    research: "Shadowed 4 cafes for a full day each; mapped 22 operational touchpoints and quantified time-loss per shift.",
    jtbd: "When it's a rush hour, I want one system that keeps orders, kitchen and payments in sync, so my team doesn't drop tickets.",
    prd: "Single-app KDS, QR ordering, POS, CRM and inventory with a unified operator dashboard.",
    metrics: [
      "Kitchen ticket time ↓ ~31% in a 3-cafe pilot (operator self-reported)",
      "Order errors ↓ ~42% in the same pilot (operator self-reported)",
      "3 cafes onboarded in beta",
    ],
    lessons: "Operators don't want features — they want fewer taps. Used the Opportunity Solution Tree to keep every screen tied to a measurable operator outcome.",
  },
];

const experience = [
  {
    id: "exp-1",
    company: "Greenfinch Global Consultancy",
    role: "Business Analyst & QA Intern",
    period: "Recent",
    active: true,
    location: "Jaipur, India",
    description: "Gathered requirements, wrote BRDs and PRDs, ran QA cycles and validated user flows alongside developers and clients.",
    highlights: [
      "Owned requirement clarity across sprints",
      "Bug triage and regression coverage",
      "Client discussions and acceptance criteria",
    ],
  },
  {
    id: "exp-2",
    company: "Assert InfoTech",
    role: "Business Analyst",
    period: "Earlier",
    active: false,
    location: "Jaipur, India",
    description: "Stakeholder communication, workflow analysis and functional specifications across product discussions and testing support.",
    highlights: [
      "Requirement gathering and documentation",
      "Feature validation and acceptance criteria",
      "Process improvement across teams",
    ],
  },
];

const frameworks = [
  { name: "JTBD", tag: "Discovery", desc: "Understand the underlying job customers hire your product to do — beyond features.", usedIn: "kartify" },
  { name: "Opportunity Solution Tree", tag: "Discovery", desc: "Teresa Torres' tree connecting outcomes → opportunities → solutions → experiments.", usedIn: "cafeos" },
  { name: "North Star", tag: "Strategy", desc: "The one metric that captures the value you deliver to customers.", usedIn: "tapinfi" },
  { name: "Kano", tag: "Feature Strategy", desc: "Classify features into basics, performance and delighters to avoid feature bloat.", usedIn: "finmate" },
  { name: "RICE", tag: "Prioritization", desc: "Score initiatives by Reach × Impact × Confidence ÷ Effort to make trade-offs explicit.", usedIn: "ai-campus" },
];

const articles = [
  {
    id: "art-1",
    slug: "windsurf-vs-cursor",
    title: "Windsurf vs Cursor: an AI PM's take",
    platform: "Medium",
    date: "2026-07-20",
    readTime: "7 min",
    url: "https://medium.com/@durlabhdaryani",
    excerpt: "Both Windsurf and Cursor are strong AI-native IDEs, but they optimise for different product jobs. Here's how I'd choose between them as an AI PM shipping real product.",
  },
  {
    id: "art-2",
    slug: "mvp-in-6-weeks",
    title: "How I build MVPs in 6 weeks",
    platform: "Medium",
    date: "2025-05-12",
    readTime: "6 min",
    url: "https://medium.com/@durlabhdaryani",
    excerpt: "A repeatable operating cadence for going from a fuzzy problem to a working, validated product in six weeks — without heroics.",
  },
  {
    id: "art-3",
    slug: "ai-product-development-2025",
    title: "AI Product Development in 2025",
    platform: "Medium",
    date: "2025-04-02",
    readTime: "8 min",
    url: "https://medium.com/@durlabhdaryani",
    excerpt: "Building AI-native products is less about the model and more about the loops around it — evals, prompts-as-spec, and human-in-the-loop.",
  }
];

const skills = {
  Product: [
    "Discovery", "Strategy", "Roadmapping", "PRDs", "Business Analysis",
    "User Interviews", "Personas", "JTBD", "Journey Mapping",
    "Prioritization (RICE / Kano / MoSCoW)", "North Star", "A/B Testing", "Analytics",
  ],
  "AI & Automation": [
    "LLMs", "Prompt Engineering", "AI Agents", "MCP", "RAG", "n8n", "No-Code",
  ],
  "Design & Tools": [
    "Figma", "Wireframing", "UI/UX",
  ],
  Technical: [
    "SQL", "Firebase", "Supabase", "Next.js", "React", "Node.js", "MongoDB", "GitHub",
  ],
  Delivery: [
    "Agile", "Scrum", "Sprint Planning", "Stakeholder Management", "Cross-functional Collaboration",
  ],
};

const linkedinPosts = [
  {
    id: "post-1",
    date: "2026-07-15",
    title: "AI PM Evaluation Loops",
    embedCode: '<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7200000000000000000" height="500" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>',
    postUrl: "https://www.linkedin.com/in/durlabhdaryani",
  },
  {
    id: "post-2",
    date: "2026-07-02",
    title: "Customer Discovery Without a Research Team",
    embedCode: '<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:7200000000000000001" height="500" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>',
    postUrl: "https://www.linkedin.com/in/durlabhdaryani",
  }
];

const sectionsToSeed = [
  { section: 'profile', data: profile },
  { section: 'about', data: about },
  { section: 'featuredProducts', data: featuredProducts },
  { section: 'projects', data: featuredProducts },
  { section: 'caseStudies', data: caseStudies },
  { section: 'experience', data: experience },
  { section: 'frameworks', data: frameworks },
  { section: 'articles', data: articles },
  { section: 'skills', data: skills },
  { section: 'linkedinPosts', data: linkedinPosts },
  { section: 'linkedin', data: linkedinPosts }
];

async function seed() {
  console.log('Signing in as admin user...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'durlabhdaryani70@gmail.com',
    password: 'Durlabh@9887824058'
  })

  if (authError) {
    console.error('Sign-in failed:', authError.message)
    return
  }

  console.log('Authenticated! Seeding portfolio mock data into Supabase...')
  for (const item of sectionsToSeed) {
    const { error } = await supabase
      .from('portfolio_content')
      .upsert(item, { onConflict: 'section' })

    if (error) {
      console.error(`Error seeding ${item.section}:`, error.message)
    } else {
      console.log(`✓ Successfully seeded section: "${item.section}"`)
    }
  }
  console.log('Finished seeding database!')
}

seed()
