import { useMemo } from "react";
import { Check, Compass, ExternalLink, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
import { LIFE_AREAS } from "@/logic/assessmentModel";
import {
  buildCurrentState,
  buildFutureHorizons,
  buildFutureScenarios,
  buildNextAction,
  buildRiskRadar,
  buildTwinInsights,
  dimensionLabel,
  getDimensionSummary,
  getInsight,
  getTopThreePriorities,
} from "@/logic/intelligenceEngine";

// ---------- Reusable atoms ----------
function ScoreRing({ score }) {
  const safe = Number.isFinite(Number(score)) ? Number(score) : 0;
  const circumference = 2 * Math.PI * 94;
  return (
    <div className="dashboard-ring" data-testid="life-score-visual">
      <svg viewBox="0 0 220 220" role="img" aria-label={`Life score ${safe} out of 100`}>
        <circle className="ring-track" cx="110" cy="110" r="94" />
        <circle
          className="ring-value"
          cx="110"
          cy="110"
          r="94"
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (safe / 100) * circumference }}
        />
      </svg>
      <div className="ring-text">
        <strong data-testid="life-score-value" aria-live="polite">{safe}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

function LevelBadge({ level, improving }) {
  return (
    <span
      className={`level-badge level-${level.toLowerCase()} ${improving ? "improving" : ""}`}
      data-testid={`risk-level-${level.toLowerCase()}`}
    >
      {level}
      {improving && <span className="improving-suffix"> · Improving</span>}
    </span>
  );
}

// ---------- Panels ----------
function CurrentStatePanel({ state }) {
  return (
    <article className="current-state-panel panel" data-testid="current-state-section">
      <div className="panel-label"><span>00</span><b>My current state</b><span>PERSONAL READOUT</span></div>
      <h2 data-testid="current-state-heading">Where you are, in plain words.</h2>
      <p data-testid="current-state-summary">{state.summary}</p>
      <div className="current-state-meta">
        <span data-testid="current-state-strongest">Strongest · <b>{state.strongest.label}</b></span>
        <span data-testid="current-state-urgent">Most urgent · <b>{state.urgent.label}</b></span>
      </div>
    </article>
  );
}

function PriorityCard({ priority, onComplete }) {
  const completed = priority.status === "completed";
  return (
    <article className={`priority-card ${completed ? "completed" : ""}`} data-testid={`priority-card-${priority.tier.toLowerCase()}`}>
      <header className="priority-head">
        <span className={`tier-badge tier-${priority.tier.toLowerCase()}`} data-testid={`priority-tier-${priority.tier.toLowerCase()}`}>
          #{["urgent","important","opportunity"].indexOf(priority.tier.toLowerCase()) + 1} {priority.tier}
        </span>
        <span className="priority-area" data-testid={`priority-area-${priority.tier.toLowerCase()}`}>{priority.area.label}</span>
        <span className="priority-score" data-testid={`priority-score-${priority.tier.toLowerCase()}`}>
          {priority.currentScore}<small>/10</small>
        </span>
      </header>
      <dl className="priority-detail">
        <div><dt>Goal</dt><dd data-testid={`priority-goal-${priority.tier.toLowerCase()}`}>{priority.goal}</dd></div>
        <div><dt>Problem / friction</dt><dd data-testid={`priority-problem-${priority.tier.toLowerCase()}`}>{priority.problem}</dd></div>
        <div><dt>Recommended behaviour</dt><dd data-testid={`priority-what-${priority.tier.toLowerCase()}`}>{priority.recommendation.what}</dd></div>
        <div><dt>When</dt><dd data-testid={`priority-when-${priority.tier.toLowerCase()}`}>{priority.recommendation.when}</dd></div>
        <div><dt>How often</dt><dd data-testid={`priority-howoften-${priority.tier.toLowerCase()}`}>{priority.recommendation.howOften}</dd></div>
        <div><dt>If you do it</dt><dd className="priority-benefit" data-testid={`priority-benefit-${priority.tier.toLowerCase()}`}>{priority.benefit}</dd></div>
        <div><dt>If you don&apos;t</dt><dd className="priority-consequence" data-testid={`priority-consequence-${priority.tier.toLowerCase()}`}>{priority.consequence}</dd></div>
      </dl>
      <footer className="priority-foot">
        <a href={priority.source.url} target="_blank" rel="noopener noreferrer" className="source-link" data-testid={`priority-source-${priority.tier.toLowerCase()}`}>
          {priority.source.title} <ExternalLink size={13} />
        </a>
        <span className="source-meta">
          <span>{priority.source.type}</span><span>·</span><span>{priority.source.cost}</span><span>·</span><span>Checked {priority.source.checked}</span>
        </span>
        {completed ? (
          <span className="priority-done" data-testid={`priority-done-${priority.tier.toLowerCase()}`}>
            <Check size={14} /> Completed
          </span>
        ) : (
          <button
            type="button"
            className="ghost-button"
            onClick={onComplete}
            data-testid={`priority-complete-${priority.tier.toLowerCase()}`}
          >
            Mark complete <Check size={14} />
          </button>
        )}
      </footer>
      <small className="priority-disclaimer">{priority.disclaimer}</small>
    </article>
  );
}

function TopThreeSection({ priorities, onComplete }) {
  return (
    <article className="top-three-panel panel" data-testid="top-three-priorities-section">
      <div className="panel-label"><span>02</span><b>Top 3 Life Twin recommendations</b><span>URGENT · IMPORTANT · OPPORTUNITY</span></div>
      <div className="priority-grid">
        {priorities.map((priority) => (
          <PriorityCard key={priority.key} priority={priority} onComplete={() => onComplete(priority.key)} />
        ))}
      </div>
    </article>
  );
}

function ObstaclePanel({ obstacles }) {
  const list = Array.isArray(obstacles) ? obstacles : [];
  const heading = list.length === 0 ? "unnamed." : list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} & ${list[list.length - 1]}`;
  return (
    <article className="obstacle-panel panel" data-testid="biggest-obstacle-card">
      <div className="panel-label"><span>03</span><b>Biggest obstacles</b></div>
      <Compass size={26} />
      <p>{list.length > 1 ? "Your current friction points are" : "Your biggest obstacle is"}</p>
      <h2 data-testid="biggest-obstacle-value">{heading}</h2>
      {list.length > 0 && (
        <ul className="obstacle-list" data-testid="biggest-obstacle-list">
          {list.map((item) => (
            <li key={item} data-testid={`biggest-obstacle-item-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</li>
          ))}
        </ul>
      )}
      <span className="obstacle-note">Naming the friction reduces it. Every action here works around this.</span>
    </article>
  );
}

function TwinPanel({ insights }) {
  return (
    <article className="twin-panel panel" data-testid="life-twin-section">
      <div className="panel-label"><span>04</span><b>Your AI Life Twin</b><Sparkles size={16} /></div>
      <h2>Patterns worth<br /><i>noticing.</i></h2>
      <p className="twin-subtitle">A coach-style read of your assessment</p>
      <ol>
        {insights.map((insight, index) => (
          <li key={insight} data-testid={`life-twin-insight-${index + 1}`}>
            <span>0{index + 1}</span>{insight}
          </li>
        ))}
      </ol>
      <small className="twin-disclaimer">Local, deterministic synthesis from your answers. Not a real AI model, medical, or financial opinion.</small>
    </article>
  );
}

function NextActionPanel({ action, onComplete }) {
  const completed = action.status === "completed";
  return (
    <article className={`action-panel panel ${completed ? "completed" : ""}`} data-testid="next-best-action-section">
      <div className="panel-label"><span>05</span><b>Your next best action</b><span>{completed ? "COMPLETE" : "FOR TODAY"}</span></div>
      <div className="action-content">
        <div className="action-mark">{completed ? <Check size={28} /> : <span>→</span>}</div>
        <div className="action-body">
          {completed ? (
            <>
              <p data-testid="next-action-label">One good move, made.</p>
              <h2 data-testid="next-action-text">Great! You&apos;ve completed your next best action.</h2>
              <p className="action-followup">Your Life Risk Radar has updated to reflect this decision.</p>
            </>
          ) : (
            <>
              <p data-testid="next-action-label">Make it small. Make it real.</p>
              <h2 data-testid="next-action-text">{action.what}.</h2>
              <dl className="action-detail-grid">
                <div><dt>When</dt><dd data-testid="next-action-when">{action.when}</dd></div>
                <div><dt>How often</dt><dd data-testid="next-action-how">{action.howOften}</dd></div>
                <div className="action-why"><dt>Why now</dt><dd data-testid="next-action-why">{action.why}</dd></div>
                <div className="action-if"><dt>If you do it</dt><dd data-testid="next-action-if-do">{action.ifYouDo}</dd></div>
                <div className="action-if"><dt>If you don&apos;t</dt><dd data-testid="next-action-if-dont">{action.ifYouDont}</dd></div>
              </dl>
              <button className="primary-button" data-testid="next-action-complete-button" onClick={onComplete}>
                Mark complete <Check size={17} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function RiskRadar({ risks }) {
  return (
    <article className="risk-panel panel" data-testid="life-risk-radar-section">
      <div className="panel-label"><span>07</span><b>Life risk radar</b><span>WHERE TO WATCH</span></div>
      <div className="risk-list">
        {risks.map((risk) => (
          <div key={risk.key} className="risk-row" data-testid={`risk-radar-${risk.key}`}>
            <div className="risk-head">
              <LevelBadge level={risk.level} improving={risk.improving} />
              <h4>{risk.label}</h4>
            </div>
            <p className="risk-why">{risk.why}</p>
            <p className="risk-response"><b>Response · </b>{risk.response}</p>
          </div>
        ))}
      </div>
      <small className="risk-disclaimer">Local, deterministic signals from your answers. Not medical, legal, or financial advice.</small>
    </article>
  );
}

function FutureSelfPanel({ horizons, scenarios, currentScore }) {
  const items = [
    { key: "today", data: horizons.today, hasScore: false },
    { key: "days10", data: horizons.days10, hasScore: true },
    { key: "days30", data: horizons.days30, hasScore: true },
    { key: "year1", data: horizons.year1, hasScore: true },
    { key: "years10", data: horizons.years10, hasScore: true },
  ];
  return (
    <article className="future-panel panel" data-testid="future-self-section">
      <div className="panel-label"><span>08</span><b>Your future self</b><span>SCENARIOS · NOT PREDICTIONS</span></div>
      <p className="future-lede">
        A conditional view from today&apos;s Life Score of <strong data-testid="future-current-score">{currentScore}</strong>. Numbers are approximate; language is intentionally cautious.
      </p>

      <div className="horizon-grid">
        {items.map((item) => (
          <div key={item.key} className="horizon-card" data-testid={`future-horizon-${item.key}`}>
            <span className="horizon-label">{item.data.label}</span>
            {item.hasScore && (
              <div className="horizon-projected">
                <span data-testid={`future-horizon-projected-${item.key}`}>{item.data.projected}</span>
                <b>/ 100</b>
              </div>
            )}
            <p>{item.data.note}</p>
          </div>
        ))}
      </div>

      <p className="future-trend-note" data-testid="future-trend-note"><TrendingUp size={14} /> {horizons.trendNote}</p>

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <div key={scenario.key} className={`scenario-card scenario-${scenario.key}`} data-testid={`future-scenario-${scenario.key}`}>
            <span className="scenario-label">{scenario.label}</span>
            <div className="scenario-numbers">
              <span data-testid={`future-scenario-projected-${scenario.key}`}>{scenario.projected}</span>
              <b>{scenario.delta}</b>
            </div>
            <p>{scenario.note}</p>
          </div>
        ))}
      </div>
      <small className="future-disclaimer">Approximate scenarios; not predictions or guarantees. Uses conditional language throughout.</small>
    </article>
  );
}

function ProgressPanel({ completedCount, totalCount }) {
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  return (
    <article className="progress-panel panel" data-testid="today-progress-section">
      <div className="panel-label"><span>06</span><b>Today&apos;s progress</b></div>
      <div className="progress-stat">
        <strong data-testid="today-progress-value" aria-live="polite">{completedCount} / {totalCount}</strong>
        <span>actions completed</span>
      </div>
      <div className="progress-bar"><span style={{ width: `${percent}%` }} /></div>
      <div className="streak">
        <span>✦</span>
        <b data-testid="streak-value">{completedCount > 0 ? "1 Day" : "0 Days"}</b>
        <small>Keep the signal going.</small>
      </div>
    </article>
  );
}

function AreaCard({ area, assessment }) {
  const summary = getDimensionSummary(assessment, area.key);
  return (
    <article className="area-card" data-testid={`life-area-card-${area.key}`}>
      <div className="area-card-header">
        <div className="area-card-top">
          <span className="area-icon">{area.icon}</span>
          <span className="area-score" data-testid={`life-area-score-${area.key}`}>
            {summary.score}<small>/10</small>
          </span>
        </div>
        <h3>{area.label}</h3>
        <div className="meter"><span style={{ width: `${summary.score * 10}%` }} /></div>
        <p>{getInsight(summary.score)} <em>({dimensionLabel(summary.score)})</em></p>
      </div>
      <div className="area-detail" data-testid={`area-detail-${area.key}`}>
        <div className="area-detail-row">
          <span className="area-detail-label">Friction points</span>
          <div className="chip-row">
            {summary.frictions.length === 0 && <span className="chip chip-muted">None selected</span>}
            {summary.frictions.map((friction) => (
              <span key={friction} className="chip" data-testid={`area-friction-${area.key}-${friction.toLowerCase().replace(/\s+/g, "-")}`}>{friction}</span>
            ))}
          </div>
        </div>
        <div className="area-detail-row">
          <span className="area-detail-label">Signal</span>
          <div className="risk-inline">
            <LevelBadge level={summary.dimensionRisk.level} improving={summary.dimensionRisk.improving} />
            <p>{summary.dimensionRisk.why}</p>
          </div>
        </div>
        <div className="area-detail-row">
          <span className="area-detail-label">Try this first</span>
          <p className="subaction" data-testid={`area-subaction-${area.key}`}>{summary.behaviour.what}. {summary.behaviour.when}. {summary.behaviour.howOften}.</p>
        </div>
        <div className="area-detail-row">
          <span className="area-detail-label">Verified resources</span>
          <ul className="source-list">
            {summary.sources.map((source, index) => (
              <li key={source.url} data-testid={`area-source-${area.key}-${index + 1}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                  {source.title} <ExternalLink size={13} />
                </a>
                <p>{source.why}</p>
                <div className="source-meta">
                  <span>{source.type}</span><span>·</span><span>{source.cost}</span><span>·</span><span>Checked {source.checked}</span>
                </div>
              </li>
            ))}
          </ul>
          <small className="source-note">{summary.disclaimer}</small>
        </div>
      </div>
    </article>
  );
}

// ---------- Dashboard root ----------
export default function Dashboard({ data, onReset, setData }) {
  const { assessment, score } = data;
  const actions = data.actions || {};

  const currentState = useMemo(() => buildCurrentState(assessment), [assessment]);
  const priorities = useMemo(() => getTopThreePriorities(assessment, actions), [assessment, actions]);
  const twinInsights = useMemo(() => buildTwinInsights(assessment), [assessment]);
  const nextAction = useMemo(() => buildNextAction(assessment, actions), [assessment, actions]);
  const risks = useMemo(() => buildRiskRadar(assessment, actions), [assessment, actions]);
  const horizons = useMemo(() => buildFutureHorizons(score, assessment, actions), [score, assessment, actions]);
  const scenarios = useMemo(() => buildFutureScenarios(score, assessment, actions), [score, assessment, actions]);

  const completeAction = (key) => {
    const nextActions = { ...actions, [key]: { status: "completed", completedAt: new Date().toISOString() } };
    // Completing NBA also completes the corresponding priority (they point at the same behaviour).
    if (key === "nba" && nextAction) {
      nextActions[nextAction.priorityKey] = { status: "completed", completedAt: new Date().toISOString() };
    }
    if (key.startsWith("priority-") && nextAction && key === nextAction.priorityKey) {
      nextActions.nba = { status: "completed", completedAt: new Date().toISOString() };
    }
    setData({ ...data, actions: nextActions });
  };

  const totalActions = 1 + priorities.length; // NBA + top 3
  const completedCount = (nextAction && nextAction.status === "completed" ? 1 : 0) + priorities.filter((p) => p.status === "completed").length;

  return (
    <main className="dashboard page-enter">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Your personal readout <span>·</span> Today</p>
          <h1>My life, <i>in motion.</i></h1>
        </div>
        <button className="reset-button" data-testid="start-over-button" onClick={onReset}>
          <RotateCcw size={15} /> Start over
        </button>
      </div>

      <section className="dashboard-grid">
        <CurrentStatePanel state={currentState} />

        <article className="score-panel panel">
          <div className="panel-label"><span>01</span><b>Life score</b><span>1 = STRONGEST · 10 = NEEDS ATTENTION</span></div>
          <div className="score-panel-content">
            <ScoreRing score={score} />
            <div className="score-summary">
              <p className="score-kicker">A starting point, not a verdict.</p>
              <h2 data-testid="life-score-heading">YOUR LIFE SCORE</h2>
              <p>
                Based on your responses across six areas, your current shape is{" "}
                <strong>{score >= 70 ? "full of momentum" : score >= 45 ? "steady with clear room" : "ready for a reset"}</strong>. Higher Life Score is better; individual dimension ratings run 1 (strongest) → 10 (needs most attention).
              </p>
              <small data-testid="life-score-disclaimer">
                AI-generated personal assessment score based on your responses. Not scientifically validated.
              </small>
            </div>
          </div>
        </article>

        <TopThreeSection priorities={priorities} onComplete={completeAction} />
        <ObstaclePanel obstacles={assessment.obstacles} />
        <TwinPanel insights={twinInsights} />
        {nextAction && <NextActionPanel action={nextAction} onComplete={() => completeAction("nba")} />}
        <ProgressPanel completedCount={completedCount} totalCount={totalActions} />

        <section className="areas-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The six signals</p>
              <h2>Life areas</h2>
            </div>
            <span>1 = STRONGEST · 10 = NEEDS ATTENTION</span>
          </div>
          <div className="area-grid">
            {LIFE_AREAS.map((area) => (
              <AreaCard key={area.key} area={area} assessment={assessment} />
            ))}
          </div>
        </section>

        <RiskRadar risks={risks} />
        <FutureSelfPanel horizons={horizons} scenarios={scenarios} currentScore={score} />

        <footer className="dashboard-footer">
          <span>LIFE UPGRADE AI</span>
          <span>Most urgent today · <b>{currentState.urgent.label}</b></span>
          <span>Know where you are. Know what to do next.</span>
        </footer>
      </section>
    </main>
  );
}
