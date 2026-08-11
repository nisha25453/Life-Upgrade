// Curated behaviour library + verified sources per dimension.
// SCORING NOTE (v2): dimension ratings are 1 = strongest, 10 = needs most attention.
// All sources are hardcoded, dated, and public. No live fetches.

const CHECKED = "2026-02-15";

const src = (title, url, type, cost, why) => ({ title, url, type, cost, why, checked: CHECKED });

// ---------- Verified sources by area ----------
export const SOURCES = {
  health: [
    src("WHO · Physical activity guidelines", "https://www.who.int/news-room/fact-sheets/detail/physical-activity", "Official / authoritative source", "Free", "Global public-health guidance on realistic weekly movement targets."),
    src("CDC · How much sleep do I need?", "https://www.cdc.gov/sleep/about/index.html", "Official / authoritative source", "Free", "Concrete age-based sleep windows for calibrating recovery."),
    src("Ministry of AYUSH · Yoga & wellness resources", "https://ayush.gov.in/", "Government wellness authority", "Free", "Government-curated yoga, meditation, and lifestyle resources."),
    src("NIMH · Managing stress", "https://www.nimh.nih.gov/health/publications/stress", "Recognized government source", "Free", "Practical, non-clinical starting points for stress regulation."),
  ],
  career: [
    src("U.S. Bureau of Labor Statistics · Occupational Outlook Handbook", "https://www.bls.gov/ooh/", "Official labour-market source", "Free", "Authoritative role-by-role skill and outlook data."),
    src("Microsoft Learn · Power BI learning path", "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "Official product-training source", "Free", "Free, vendor-neutral modules for analytics upskilling — often referenced in analytics roles."),
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

// ---------- Behaviour templates per area ----------
// Each returns a structured recommendation with What/When/HowOften/Benefit/Consequence.
// Templates read from the deep-dive answers so the copy references the user's own inputs.

const HEALTH_BEHAVIOURS = (a) => {
  const health = a.health || {};
  if (health.sleep === "Poor" || health.sleep === "Fair") {
    return {
      what: "Set a fixed lights-off window tonight and put your phone outside the bedroom",
      when: "Starting tonight, 30 minutes before your intended sleep time",
      howOften: "Every night for the next 10 days",
      benefit: "If sleep timing stabilises for 10 days, energy and stress may improve alongside a more consistent morning routine.",
      consequence: "If your sleep window keeps shifting, fatigue and stress patterns are likely to continue interfering with the other goals you set.",
    };
  }
  if (health.exercise === "Rarely" || health.exercise === "1–2 days/week") {
    return {
      what: "Take a 30-minute brisk walk outdoors",
      when: "After lunch or before dinner, whichever is easier to protect",
      howOften: "For 10 consecutive days",
      benefit: "If activity and food intake support a mild calorie deficit, a small gradual improvement in weight and energy may be possible — around 0.5 kg over ~10 days for some people. Results vary substantially by person.",
      consequence: "If activity does not increase, current inactivity may continue and your movement-related goal may remain unchanged.",
    };
  }
  return {
    what: "Add one 10-minute breathing or short-mobility session to an existing daily routine",
    when: "Right after brushing your teeth in the morning",
    howOften: "Every day for the next 10 days",
    benefit: "If practised consistently, stress and energy variability may reduce over the 10-day window.",
    consequence: "If skipped, current stress and energy patterns are likely to remain unchanged.",
  };
};

const CAREER_BEHAVIOURS = (a) => {
  const career = a.career || {};
  const target = career.targetRole || "your target role";
  if (career.goal === "Career switch" && !career.targetRole) {
    return {
      what: "Name one specific target role and one industry you're moving into",
      when: "Tonight, before opening any job board",
      howOften: "Once — this becomes the anchor for the next steps",
      benefit: "If a specific target role is named, your skill map and applications become measurably sharper.",
      consequence: "If the target stays vague, applications may continue to feel scattered and results may remain inconsistent.",
    };
  }
  return {
    what: `List three skills required for ${target} and mark the one clearest gap`,
    when: "At 6:00 pm today",
    howOften: "One 30-minute session; revisit weekly",
    benefit: "If a specific skill gap is named, learning time can compound toward roles that expect that skill.",
    consequence: `If the skill gap for ${target} stays unnamed, you may remain less competitive for roles requiring it.`,
  };
};

const MONEY_BEHAVIOURS = (a) => {
  const money = a.money || {};
  const goals = Array.isArray(money.moneyGoals) ? money.moneyGoals : [];
  if (money.emergency === "None" || money.emergency === "Less than 1 month") {
    return {
      what: "Set a first emergency-fund milestone equal to one month of essential expenses",
      when: "This weekend, in one 30-minute review",
      howOften: "Track once per month",
      benefit: "If a first milestone is reached, an unexpected expense is less likely to derail your other goals.",
      consequence: "If no milestone is set, one unexpected expense could reset progress on your other money goals.",
    };
  }
  if (goals.includes("Debt reduction") || money.debt === "Yes") {
    return {
      what: "List every high-interest debt with amount and interest rate on one page",
      when: "This weekend, in one 30-minute session",
      howOften: "Refresh monthly",
      benefit: "If listed and ordered by interest rate, the next payment can prioritise the costliest debt first.",
      consequence: "If left uncatalogued, higher-rate balances may keep growing while other repayments continue.",
    };
  }
  return {
    what: "Review one week of discretionary spending and circle the biggest recurring leak",
    when: "Before dinner today",
    howOften: "One 20-minute review; repeat weekly",
    benefit: "If the biggest leak is identified and reduced, monthly savings may increase without lifestyle disruption.",
    consequence: "If recurring costs remain unreviewed, small leaks may continue to accumulate each month.",
  };
};

const PRODUCTIVITY_BEHAVIOURS = (a) => {
  const p = a.productivity || {};
  return {
    what: `Complete one 30-minute focus block on your most postponed priority${p.energyPeriod ? ` during your ${p.energyPeriod.toLowerCase()} peak` : ""}`,
    when: "Before opening any non-essential app or meeting",
    howOften: "Once today; repeat 5 weekdays",
    benefit: "If the block runs on 5 weekdays, the number of overdue priorities may drop noticeably over the next month.",
    consequence: `If postponement continues${p.postponing ? ` (currently ${p.postponing.toLowerCase()})` : ""}, deadline pressure may compound and rework may increase.`,
  };
};

const LEARNING_BEHAVIOURS = (a) => {
  const l = a.learning || {};
  const skill = l.targetSkill || "your target skill";
  return {
    what: `Spend 30 minutes on one project-based lesson toward ${skill}`,
    when: "Tonight",
    howOften: "3 sessions this week; then reassess",
    benefit: `If sessions run consistently, readiness for roles requiring ${skill} may improve over the next 30 days.`,
    consequence: `If skill practice is skipped, readiness for roles requiring ${skill} may not change.`,
  };
};

const RELATIONSHIP_BEHAVIOURS = (a) => {
  const r = a.relationships || {};
  const who = (r.area || "the person").toLowerCase();
  const focus = (r.focus || "communication").toLowerCase();
  return {
    what: `Send one thoughtful message to your ${who} that names one thing you appreciate and asks for a 15-minute conversation about ${focus}`,
    when: "Tonight before bed",
    howOften: "One message today; one follow-up within the week",
    benefit: `If the conversation happens, ${focus} may improve and coordination or closeness may steady over the coming weeks.`,
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

// Safety disclaimers per area
export const DISCLAIMER = {
  health: "General education only; not medical advice or a treatment plan.",
  career: "Job availability and outcomes vary; this does not guarantee employment.",
  money: "Educational guidance only; verify decisions with a qualified financial professional. Not personalised regulated advice.",
  productivity: "A behavioural experiment, not a diagnosis.",
  learning: "Check current course dates and certificate terms directly at the source.",
  relationships: "Not therapy; seek qualified support for severe distress or safety concerns.",
};
