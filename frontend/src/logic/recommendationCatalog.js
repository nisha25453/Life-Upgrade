// Curated authoritative sources — deterministic, hardcoded, no live fetches.
// Each recommendation shows title, why, source, source type, cost, url, checked date.
const CHECKED = "2026-02-15";

export const RECOMMENDATIONS = {
  health: {
    headline: "A low-friction health reset",
    subaction: "Walk for 20 minutes after lunch, five days this week, at a comfortable pace.",
    sources: [
      {
        title: "WHO · Physical activity guidelines",
        why: "Global public-health guidance on realistic weekly movement targets — a strong anchor for a first routine.",
        url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
        type: "Official / authoritative source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "CDC · How much sleep do I need?",
        why: "Concrete, age-based sleep windows to calibrate your recovery baseline.",
        url: "https://www.cdc.gov/sleep/about/index.html",
        type: "Official / authoritative source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "NIMH · Managing stress",
        why: "Practical, non-clinical starting points for stress regulation.",
        url: "https://www.nimh.nih.gov/health/publications/stress",
        type: "Recognized government source",
        cost: "Free",
        checked: CHECKED,
      },
    ],
    note: "General education only; not medical advice or a treatment plan.",
  },
  career: {
    headline: "Turn your target role into a skill map",
    subaction: "Write one target role, three required skills, and one evidence project before applying.",
    sources: [
      {
        title: "U.S. Bureau of Labor Statistics · Occupational Outlook Handbook",
        why: "Authoritative role-by-role skill and outlook data — a cleaner input than social feeds.",
        url: "https://www.bls.gov/ooh/",
        type: "Official labour-market source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "Coursera · Career Academy (free-to-audit tracks)",
        why: "Reputable role-aligned learning paths; audit tracks give you the skill map without cost.",
        url: "https://www.coursera.org/career-academy",
        type: "Recognized learning platform",
        cost: "Free to audit / paid certificate",
        checked: CHECKED,
      },
      {
        title: "Harvard Business Review · Managing yourself",
        why: "Editorial, research-backed articles on positioning, career changes, and interviewing.",
        url: "https://hbr.org/topic/subject/managing-yourself",
        type: "Recognized editorial source",
        cost: "Limited free / paid",
        checked: CHECKED,
      },
    ],
    note: "Job availability and outcomes vary; this does not guarantee employment.",
  },
  money: {
    headline: "Build financial breathing room",
    subaction: "Review one month of spending and write a realistic first emergency-fund milestone.",
    sources: [
      {
        title: "SEBI Investor · Financial planning",
        why: "Regulator-produced basics on planning, emergency funds, and investment principles.",
        url: "https://investor.sebi.gov.in/financial_planning.html",
        type: "Official / authoritative source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "RBI · Financial literacy resources",
        why: "Central-bank curriculum on saving, borrowing, and everyday financial decisions.",
        url: "https://www.rbi.org.in/financialeducation/home.aspx",
        type: "Official / authoritative source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "OECD · International Network on Financial Education",
        why: "Cross-country research on effective personal-finance habits and traps.",
        url: "https://www.oecd.org/finance/financial-education/",
        type: "International research source",
        cost: "Free",
        checked: CHECKED,
      },
    ],
    note: "Educational guidance only; verify major decisions with a qualified financial professional.",
  },
  productivity: {
    headline: "Protect one focused block",
    subaction: "Schedule one 20-minute focus block before any non-essential app or meeting.",
    sources: [
      {
        title: "Microsoft Learn · Personal productivity fundamentals",
        why: "Vendor-neutral primer on planning, focus blocks, and reducing meeting overload.",
        url: "https://learn.microsoft.com/en-us/training/paths/m365-personal-productivity/",
        type: "Recognized professional source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "Cal Newport · Deep Work archive",
        why: "Practitioner writing on protecting focus without gadgets or subscriptions.",
        url: "https://calnewport.com/blog/",
        type: "Practitioner source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "Todoist · Getting Things Done in 15 minutes",
        why: "A compact walk-through of the GTD method — useful even if you use another tool.",
        url: "https://www.todoist.com/productivity-methods/getting-things-done",
        type: "Recognized product guide",
        cost: "Free",
        checked: CHECKED,
      },
    ],
    note: "A behaviour experiment, not a diagnosis.",
  },
  learning: {
    headline: "Learn by building",
    subaction: "Reserve your selected weekly learning time for one small project or lesson.",
    sources: [
      {
        title: "SWAYAM · Government of India learning platform",
        why: "Wide catalogue of free, university-run courses — many project-based.",
        url: "https://swayam.gov.in/",
        type: "Official learning platform",
        cost: "Free / certificate optional",
        checked: CHECKED,
      },
      {
        title: "MIT OpenCourseWare",
        why: "Rigorous course materials for foundational subjects at no cost.",
        url: "https://ocw.mit.edu/",
        type: "Recognized university source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "Khan Academy",
        why: "Great for filling foundational gaps quickly before jumping into a project.",
        url: "https://www.khanacademy.org/",
        type: "Recognized non-profit source",
        cost: "Free",
        checked: CHECKED,
      },
    ],
    note: "Check current course dates and certificate terms directly at the source.",
  },
  relationships: {
    headline: "Make one clear connection",
    subaction: "Send one thoughtful message today and ask for a 15-minute conversation without trying to solve everything.",
    sources: [
      {
        title: "Greater Good Science Center · Relationships",
        why: "Research-backed practices for communication, trust, and reconnection.",
        url: "https://greatergood.berkeley.edu/topic/relationships",
        type: "Recognized university source",
        cost: "Free",
        checked: CHECKED,
      },
      {
        title: "Gottman Institute · Relationship blog",
        why: "Practical, research-derived articles on communication patterns and repair.",
        url: "https://www.gottman.com/blog/",
        type: "Recognized practitioner source",
        cost: "Free / paid programmes exist",
        checked: CHECKED,
      },
      {
        title: "APA · Healthy relationships",
        why: "General-audience psychology guidance on healthy communication and boundaries.",
        url: "https://www.apa.org/topics/relationships",
        type: "Recognized professional source",
        cost: "Free",
        checked: CHECKED,
      },
    ],
    note: "Not therapy; seek qualified support for severe distress or safety concerns.",
  },
};

export const getRecommendation = (key) => RECOMMENDATIONS[key] || RECOMMENDATIONS.productivity;
