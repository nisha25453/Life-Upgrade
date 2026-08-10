# Life Upgrade AI — PRD

## Original problem statement
Build a polished, responsive Life Upgrade AI core MVP with the journey Landing → Free AI Life Assessment → Life Score → Dashboard → AI Life Twin Lite → Today’s Next Best Action. Keep scope intentionally small: local/mock data, deterministic calculations, no external integrations, complex auth, payments, or adjacent features. The user chose browser-only persistence.

## Architecture decisions
- React frontend with modular local logic files for assessment model, score engine, Life Twin rules, next-action rules, and localStorage.
- No backend data flow is required for this local-first MVP; starter FastAPI remains available but unused by the product journey.
- Browser localStorage persists completed assessment, score, action, and completion state.
- Paper Signal visual system: warm paper canvas, editorial serif headings, IBM Plex operational text, ink surfaces, red action accents.

## User personas
- Reflective, busy adults who feel scattered across multiple life areas and want one calm next step.
- Product reviewers evaluating a focused consumer AI experience.

## Core requirements (static)
- Landing page with tagline and CTA.
- Five-step assessment: goal, areas, six ratings, obstacle, consistency.
- Average six ratings × 10 as overall score.
- Score reveal and six area cards with insights.
- Biggest opportunity, obstacle, deterministic Life Twin observations.
- One personalized next best action with completion and today progress.
- Responsive desktop/mobile UI and stable data-testid coverage.

## What is implemented
- 2026-08-10: Built complete landing-to-action journey with responsive Paper Signal UI.
- 2026-08-10: Added deterministic calculations, localStorage persistence, reset flow, and instant completion updates.
- 2026-08-10: Added modular model/rules/storage files, score ring, area meters, Life Twin Lite, action state, live announcements, and accessibility focus states.
- 2026-08-10: Verified production build, lint, desktop preview, mobile preview, and immediate completion interaction.

## Prioritized backlog
P0: None remaining for current MVP.
P1: Optional real AI provider replacement for Life Twin rules; optional backend persistence/auth.
P2: Historical progress view, richer insights, integrations, and future self features (explicitly out of current scope).

## Next tasks
- Gather reviewer feedback on copy, score framing, and action specificity.
- If desired, replace local rules with a real AI service behind a modular adapter.
