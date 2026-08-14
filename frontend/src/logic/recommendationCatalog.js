// Curated behaviour library + verified sources per dimension.
// SCORING NOTE (v2): dimension ratings are 1 = strongest, 10 = needs most attention.
// v3 (2026-02-11): behaviours are now target-role / target-skill / goal aware so recommendations
// are specific to the user rather than generic. Still deterministic; still no live fetches.

const CHECKED = "2026-02-15";

const src = (title, url, type, cost, why) => ({ title, url, type, cost, why, checked: CHECKED });

// ---------- Verified sources by area (unchanged) ----------
export const SOURCES = {
  health: [
    src("WHO · Physical activity guidelines", "https://www.who.int/news-room/fact-sheets/detail/physical-activity", "Official / authoritative source", "Free", "Global public-health guidance on realistic weekly movement targets."),
    src("CDC · How much sleep do I need?", "https://www.cdc.gov/sleep/about/index.html", "Official / authoritative source", "Free", "Concrete age-based sleep windows for calibrating recovery."),
    src("Ministry of AYUSH · Yoga & wellness resources", "https://ayush.gov.in/", "Government wellness authority", "Free", "Government-curated yoga, meditation, and lifestyle resources."),
    src("NIMH · Managing stress", "https://www.nimh.nih.gov/health/publications/stress", "Recognized government source", "Free", "Practical, non-clinical starting points for stress regulation."),
  ],
  career: [
    src("U.S. Bureau of Labor Statistics · Occupational Outlook Handbook", "https://www.bls.gov/ooh/", "Official labour-market source", "Free", "Authoritative role-by-role skill and outlook data."),
    src("Microsoft Learn · Role-based learning paths", "https://learn.microsoft.com/en-us/training/browse/", "Official product-training source", "Free", "Free, role-aligned modules including Power BI, Azure, product and data tracks."),
    src("Coursera · Career Academy (free-to-audit tracks)", "https://www.coursera.org/career-academy", "Recognized learning platform", "Free to audit / paid certificate", "Role-aligned learning paths with audit-only tracks."),
    src("Harvard Business Review · Managing yourself", "https://hbr.org/topic/subject/managing-yourself", "Recognized editorial source", "Limited free / paid", "Research-backed articles on positioning and interviewing."),
  ],
  money: [
    src("SEBI Investor · Financial planning", "https://investor.sebi.gov.in/financial_planning.html", "Official / authoritative source", "Free", "Regulator-produced basics on planning, emergency funds, and investing."),
    src("RBI · Financial literacy resources", "https://www.rbi.org.in/financialeducation/home.aspx", "Official / authoritative source", "Free", "Central-bank curriculum on saving, borrowing, and everyday decisions."),
    src("IRDAI · Consumer education", "https://irdai.gov.in/consumer-education", "Official insurance regulator", "Free", "Regulator guidance on insurance products and consumer rights."),
    src("PFRDA · National Pension System resources", "https://www.pfrda.org.in/", "Official pension regulator", "Free", "Retirement-planning basics via NPS."),
    src("AMFI · Mutual fund investor education", "https://www.amfiindia.com/investor-corner/knowledge-center", "Industry investor-education body", "Free", "Investor-education content on mutual funds, SIPs, and asset allocation."),
  ],
  productivity: [
    src("Microsoft Learn · Personal productivity fundamentals", "https://learn.microsoft.com/en-us/training/paths/m365-personal-productivity/", "Recognized professional source", "Free", "Vendor-neutral primer on planning, focus blocks, and meeting hygiene."),
    src("Cal Newport · Deep Work archive", "https://calnewport.com/blog/", "Practitioner source", "Free", "Practitioner writing on protecting focus without gadgets or subscriptions."),
    src("Todoist · Getting Things Done in 15 minutes", "https://www.todoist.com/productivity-methods/getting-things-done", "Recognized product guide", "Free", "Compact GTD walkthrough — useful even if you use another tool."),
  ],
  learning: [
    src("SWAYAM · Government of India learning platform", "https://swayam.gov.in/", "Official learning platform", "Free / certificate optional", "Wide catalogue of university-run courses, many project-based."),
    src("NPTEL · Indian Institutes of Technology learning platform", "https://nptel.ac.in/", "Official IIT/IISc learning platform", "Free / certificate optional", "IIT-run technical courses across engineering, science, and management."),
    src("MIT OpenCourseWare", "https://ocw.mit.edu/", "Recognized university source", "Free", "Rigorous foundational course materials at no cost."),
    src("Khan Academy", "https://www.khanacademy.org/", "Recognized non-profit source", "Free", "Great for filling foundational gaps quickly."),
  ],
  relationships: [
    src("Greater Good Science Center · Relationships", "https://greatergood.berkeley.edu/topic/relationships", "Recognized university source", "Free", "Research-backed practices for communication, trust, and reconnection."),
    src("Gottman Institute · Relationship blog", "https://www.gottman.com/blog/", "Recognized practitioner source", "Free / paid programmes exist", "Practical, research-derived articles on communication and repair."),
    src("APA · Healthy relationships", "https://www.apa.org/topics/relationships", "Recognized professional source", "Free", "General-audience psychology guidance on boundaries and communication."),
  ],
};

// ---------- Target-role heuristics for Career + Learning ----------
export const inferSkillTrack = (targetOrSkill) => {
  const t = (targetOrSkill || "").toLowerCase();
  if (/product/.test(t)) return {
    label: "IT Product Management",
    course: "Coursera 'Digital Product Management' specialization (audit tier is free)",
    source: SOURCES.career[2],
  };
  if (/data|analyt|\bbi\b|power bi|sql/.test(t)) return {
    label: "Power BI / data analytics",
    course: "Microsoft Learn 'Power BI Data Analyst' learning path (free)",
    source: SOURCES.career[1],
  };
  if (/strateg|consult/.test(t)) return {
    label: "business strategy fundamentals",
    course: "Coursera 'Business Strategy' specialization (audit) + HBR 'Managing Yourself' articles",
    source: SOURCES.career[3],
  };
  if (/engineer|develop|software|program|code/.test(t)) return {
    label: "portfolio-grade coding project",
    course: "MIT OCW 'Introduction to Computer Science' or freeCodeCamp responsive-web track",
    source: SOURCES.learning[2],
  };
  if (/design|ux|ui/.test(t)) return {
    label: "design portfolio project",
    course: "Coursera 'Google UX Design Professional Certificate' (audit tier)",
    source: SOURCES.career[2],
  };
  if (/manage|lead|director/.test(t)) return {
    label: "people-leadership fundamentals",
    course: "Microsoft Learn 'Manager Fundamentals' path + HBR 'Managing Yourself'",
    source: SOURCES.career[1],
  };
  if (/market|growth|content/.test(t)) return {
    label: "growth marketing fundamentals",
    course: "Coursera 'Digital Marketing' specialization (audit tier)",
    source: SOURCES.career[2],
  };
  return {
    label: "one specific skill for your target role",
    course: "Microsoft Learn's role-based learning paths",
    source: SOURCES.career[1],
  };
};

// ---------- Behaviour templates ----------

const HEALTH_BEHAVIOURS = (a) => {
  const health = a.health || {};
  const sleepPoor = health.sleep === "Poor" || health.sleep === "Fair";
  const highStress = health.stress === "High";
  const lowExercise = health.exercise === "Rarely" || health.exercise === "1–2 days/week";

  if (sleepPoor && highStress) {
    return {
      what: "Set a fixed lights-off window tonight and try one 10-minute breathing session (WHO / Ministry of AYUSH resources both have free guided sequences)",
      when: "Every night for the next 10 nights, phone left outside the bedroom",
      howOften: "10 consecutive nights, then reassess sleep quality",
      benefit: "If sleep timing stabilises for 10 nights, stress and daytime energy usually recover before weight or fitness metrics move.",
      consequence: "If sleep and stress stay this stacked, other goals (career, focus, weight management) are unlikely to move because recovery is under-resourced.",
    };
  }
  if (lowExercise) {
    return {
      what: "Do a 30-minute brisk walk (or a beginner-level yoga session from Ministry of AYUSH) after lunch",
      when: "Today, then four more days this week",
      howOften: "10 sessions over 14 days",
      benefit: "If activity is repeated for 10 days and food intake supports a small calorie deficit, a gradual improvement in energy and possibly weight may occur (approximately 0.5 kg for some people; results vary).",
      consequence: "If activity does not increase, current inactivity patterns tend to persist and any movement-related goal will remain unchanged.",
    };
  }
  return {
    what: "Add one 10-minute mobility or breathing session (Ministry of AYUSH Yoga Break has free 5–10 minute sequences) to an existing daily routine",
    when: "Right after brushing your teeth in the morning",
    howOften: "Every day for 10 days",
    benefit: "If practised for 10 days, day-to-day stress and energy variability tend to reduce noticeably.",
    consequence: "If skipped, current stress and energy patterns will likely remain unchanged.",
  };
};

const CAREER_BEHAVIOURS = (a) => {
  const career = a.career || {};
  const target = career.targetRole;
  const track = inferSkillTrack(target || career.goal || "");

  if (career.goal === "Career switch" && !career.targetRole) {
    return {
      what: "Name one specific target role and one industry you're moving into, then check its skill signature on the BLS Occupational Outlook Handbook",
      when: "Tonight, before opening any job board",
      howOften: "Once — this becomes the anchor for every step below",
      benefit: "If a specific target is named, the next 30 days of learning and applications compound in one direction.",
      consequence: "If the target stays vague, applications and courses tend to stay scattered and results remain inconsistent.",
    };
  }
  const targetPhrase = target ? `\"${target}\"` : "your target role";
  return {
    what: `Build ${track.label}. Start ${track.course} this week and complete two lessons. This complements your existing background and supports ${targetPhrase}.`,
    when: "At 6:00 pm today, then two more 30-minute sessions this week",
    howOften: "Two 30-minute sessions per week for four weeks; end with one small evidence project",
    benefit: `If ${track.label} is built with one demonstrable project, readiness for ${targetPhrase} improves and your background becomes a stronger match.`,
    consequence: `If this specific skill gap stays unnamed and unbuilt, you may continue to be filtered out of ${targetPhrase} shortlists.`,
  };
};

const MONEY_BEHAVIOURS = (a) => {
  const money = a.money || {};
  const goals = Array.isArray(money.moneyGoals) ? money.moneyGoals : [];
  const frictions = Array.isArray(money.frictions) ? money.frictions : [];
  const noEmergency = money.emergency === "None" || money.emergency === "Less than 1 month";
  const hasDebt = money.debt === "Yes";
  const noInvestKnow = frictions.includes("Lack of investment knowledge");

  if (hasDebt && goals.includes("Debt reduction")) {
    return {
      what: "List every high-interest debt with its outstanding amount and interest rate on one page, then plan the next payment against the highest-rate balance first",
      when: "This weekend, in one 30-minute session",
      howOften: "Refresh monthly; automate the priority payment",
      benefit: "If the highest-rate debt gets consistent priority, total interest paid drops and the timeline to debt-free shortens.",
      consequence: "If balances remain uncatalogued, higher-rate interest may keep compounding and slow every other money goal.",
    };
  }
  if (noEmergency) {
    return {
      what: "Set your first emergency-fund milestone equal to one month of essential expenses; open a separate high-yield/liquid account only for this",
      when: "This weekend, in one 30-minute review",
      howOften: "Automated monthly transfer; review size every quarter",
      benefit: "If a one-month cushion is reached, one unexpected expense is less likely to reset progress on your other money goals.",
      consequence: "If no cushion is built, a single unplanned expense can force you into debt or derail other goals.",
    };
  }
  if (noInvestKnow || money.investments === "None") {
    return {
      what: "Complete the free SEBI Investor 'Financial Planning' primer and AMFI's 'Introduction to Mutual Funds' — treat this as pre-work before any product decision",
      when: "One 30-minute session tonight; one this weekend",
      howOften: "Complete both modules within seven days",
      benefit: "If investor-education modules are completed first, product decisions tend to be lower-cost and better matched to the goals you've selected.",
      consequence: "If skipped, early product choices are often driven by advertising rather than fit — the mistakes are quiet but expensive.",
    };
  }
  return {
    what: "Review one week of discretionary spending and circle the biggest recurring leak; cancel or resize one recurring item",
    when: "Before dinner today",
    howOften: "One 20-minute review this week; repeat monthly",
    benefit: "If one recurring leak is trimmed, monthly savings can increase without any lifestyle disruption — the smallest lever with the most compounding.",
    consequence: "If recurring costs stay unreviewed, small leaks continue to accumulate every month.",
  };
};

const PRODUCTIVITY_BEHAVIOURS = (a) => {
  const p = a.productivity || {};
  const many = p.unfinished === "4–6" || p.unfinished === "7+";
  const distraction = (a.productivity && a.productivity.frictions || []).includes("Distractions");
  const meetings = (a.productivity && a.productivity.frictions || []).includes("Too many meetings");

  if (meetings) {
    return {
      what: "Audit the past two weeks of your calendar and mark three recurring meetings you can decline, shorten or move async (try AI meeting-summary tools like Otter or Microsoft Copilot for the ones that stay)",
      when: "In one 30-minute session tomorrow morning",
      howOften: "Repeat every quarter",
      benefit: "If three meetings are removed or shortened, you recover a full focused block per week — the fastest path to fewer unfinished priorities.",
      consequence: "If the calendar stays as is, unfinished priorities are unlikely to reduce because focus time isn't protected.",
    };
  }
  if (distraction) {
    return {
      what: "Block a 30-minute focus session, disable non-essential notifications and use a website blocker (Cold Turkey, One Sec, or your OS Focus mode) for one recurring app",
      when: `${p.energyPeriod ? `During your ${p.energyPeriod.toLowerCase()} energy peak, tomorrow` : "Tomorrow morning"}, before opening email`,
      howOften: "Five sessions this week",
      benefit: "If distractions are pre-blocked, the same 30 minutes produces about 2× the output — measurable within a week.",
      consequence: "If distractions stay unmanaged, you'll continue paying an attention tax on every task.",
    };
  }
  return {
    what: `Complete one 30-minute focus block on the priority whose delay hurts most${many ? " — pick from your unfinished list, not from email" : ""}`,
    when: `${p.energyPeriod ? `During your ${p.energyPeriod.toLowerCase()} peak` : "Tomorrow morning"}, before opening non-essential apps`,
    howOften: "Five sessions this week",
    benefit: "If five focused blocks run in one week, the number of overdue priorities is likely to visibly drop.",
    consequence: `If postponement continues${p.postponing ? ` (currently ${p.postponing.toLowerCase()})` : ""}, deadline pressure will keep compounding and rework will keep growing.`,
  };
};

const LEARNING_BEHAVIOURS = (a) => {
  const l = a.learning || {};
  const skill = l.targetSkill || "your target skill";
  const track = inferSkillTrack(skill);
  const short = l.time === "Less than 1 hour";

  return {
    what: `Complete 30 minutes of ${track.course} tonight and finish one project-based lesson on ${skill}`,
    when: "Tonight; then two more sessions this week",
    howOften: short ? "Three 20-minute sessions this week (respecting your limited time budget)" : "Three 30-minute project-based sessions this week",
    benefit: `If sessions run consistently, readiness for roles that require ${skill} improves and the skill starts showing up on your résumé as evidence, not intent.`,
    consequence: `If practice keeps slipping, ${skill} will remain a signal on your résumé but not a demonstrated capability.`,
  };
};

const RELATIONSHIP_BEHAVIOURS = (a) => {
  const r = a.relationships || {};
  const who = (r.area || "the person").toLowerCase();
  const focus = (r.focus || "communication").toLowerCase();
  const frictions = Array.isArray(r.frictions) ? r.frictions : [];
  const conflict = frictions.includes("Conflict");

  if (conflict) {
    return {
      what: `Book a specific 20-minute conversation with your ${who} using the Greater Good Science Center's 'active constructive responding' prompt — name one thing you appreciate, one thing you'd like different, one small ask`,
      when: "Within the next 48 hours, at a time you both control",
      howOften: "One structured conversation now; one follow-up in 10 days",
      benefit: `If the conversation happens, ${focus} may improve and coordination or closeness may steady across the next weeks.`,
      consequence: `If left unaddressed, ${conflict ? "the current friction" : "the pattern"} usually compounds and grows harder to repair.`,
    };
  }
  return {
    what: `Send one thoughtful message to your ${who} that names one thing you appreciate and asks for a 15-minute conversation about ${focus}`,
    when: "Tonight before bed",
    howOften: "One message today; one 15-minute conversation this week",
    benefit: `If the conversation happens, ${focus} may improve and the relationship may steady across the coming weeks.`,
    consequence: `If nothing is initiated, current ${focus} patterns are likely to continue unchanged.`,
  };
};

export const BEHAVIOURS = {
  health: HEALTH_BEHAVIOURS,
  career: CAREER_BEHAVIOURS,
  money: MONEY_BEHAVIOURS,
  productivity: PRODUCTIVITY_BEHAVIOURS,
  learning: LEARNING_BEHAVIOURS,
  relationships: RELATIONSHIP_BEHAVIOURS,
};

export const getBehaviour = (areaKey, assessment) => (BEHAVIOURS[areaKey] || PRODUCTIVITY_BEHAVIOURS)(assessment);

export const getPrimarySource = (areaKey) => (SOURCES[areaKey] || SOURCES.productivity)[0];
export const getSources = (areaKey) => SOURCES[areaKey] || SOURCES.productivity;

export const DISCLAIMER = {
  health: "General education only; not medical advice or a treatment plan.",
  career: "Job availability and outcomes vary; this does not guarantee employment.",
  money: "Educational guidance only; verify decisions with a qualified financial professional. Not personalised regulated advice.",
  productivity: "A behavioural experiment, not a diagnosis.",
  learning: "Check current course dates and certificate terms directly at the source.",
  relationships: "Not therapy; seek qualified support for severe distress or safety concerns.",
};
