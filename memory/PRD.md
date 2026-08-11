# Life Upgrade AI — PRD

## Original problem statement
Build a personal AI Life Operating System that turns a short self-assessment into a clear life score, identifies the two biggest opportunities and the biggest obstacle, generates a specific next best action, and shows a Life Twin, Life Risk Radar, and a 30-day Future Self projection. First shipped as a small MVP, then extended into "Intelligent Life Assessment 2.0" with deep-dive per dimension, curated (mocked) authoritative recommendations, expandable dashboard cards, and 3-scenario future self.

## Architecture
- Frontend-only React app (Create React App / craco); no backend used at runtime.
- All persistence in browser localStorage (`life-upgrade-ai-state`).
- All AI/synthesis/recommendations are DETERMINISTIC and MOCKED (rules-based).
- Paper Signal design language (warm paper canvas, red-orange accent, Cormorant Garamond serif + IBM Plex Sans/Mono).

## User personas
- Ambitious professional feeling scattered across health, career, money, productivity, learning, relationships.
- Wants a single trusted read on "where I am" and one clear "what to do next" without integrations or account creation.

## Core requirements (static)
- No account, no external APIs, no live LLM calls in this phase.
- Text-only inputs (no PDF/DOCX upload yet).
- Curated web recommendations are hardcoded, deterministic, and dated.
- Dashboard must fit the same session (no navigation) with inline expandable dimension cards.

## What has been implemented (as of 2026-02-11)
- Landing (Paper Signal hero + score specimen).
- 11-step assessment: goal, areas, six 1–10 ratings, obstacle, consistency, and one deep-dive step per selected area (Health, Career incl. text resume fields, Money, Productivity, Learning, Relationships).
- Deterministic intelligence layer (`/app/frontend/src/logic/intelligenceEngine.js`):
  - Life Score (avg × 10, rounded)
  - Top 2 Opportunities with reasoned copy
  - Cross-domain Life Twin (3 insights)
  - Next Best Action (What / When / How long / Why)
  - Future Self · 30 days (3 scenarios: current, improved, low)
  - Life Risk Radar (7 signals with level + why + response)
- Curated recommendation catalog (`/app/frontend/src/logic/recommendationCatalog.js`) with 2–3 authoritative sources per area (WHO, CDC, NIMH, BLS, Coursera, HBR, SEBI, RBI, OECD, Microsoft Learn, Cal Newport, Todoist, SWAYAM, MIT OCW, Khan Academy, Greater Good, Gottman, APA), each with source type, cost, and checked date.
- Dashboard: Life Score ring, Top 2 Opportunities, Biggest Obstacle, Life Twin, Next Best Action with Mark complete, Today's Progress + streak, 6 inline-expandable area cards (score + friction chips + dimension risk + sub-action + curated sources), Life Risk Radar, 3-scenario Future Self.
- localStorage persistence, reload restores dashboard, Start-over clears state.
- Stable `data-testid` on every interactive element.
- 100% pass on the end-to-end frontend testing agent (iteration_2).

## Prioritized backlog (P0/P1/P2)
- P1: Real résumé upload (PDF/DOCX) with local parsing.
- P1: Optional real LLM synthesis behind a toggle (Emergent LLM key) — keep deterministic default.
- P1: Multi-day streak persistence with per-day action history.
- P2: Optional live source-availability check instead of the hardcoded checked date.
- P2: Split Dashboard.jsx into per-panel files if it grows beyond ~700 lines.
- P2: Print / PDF export of the readout.

## Known constraints preserved for this session
- No backend DB.
- No live web searches or LLM calls.
- Résumé is text-only.
