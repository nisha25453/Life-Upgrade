import { useMemo, useState } from "react";
import { Check, Compass, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import { LIFE_AREAS } from "@/logic/assessmentModel";
import {
  buildFutureScenarios,
  buildNextAction,
  buildRiskRadar,
  buildTwinInsights,
  getDimensionSummary,
  getInsight,
  getLowestArea,
  getTopOpportunities,
} from "@/logic/intelligenceEngine";
import { getRecommendation } from "@/logic/recommendationCatalog";
import { saveState } from "@/logic/storage";

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 94;
  return (
    <div className="dashboard-ring" data-testid="life-score-visual">
      <svg viewBox="0 0 220 220" role="img" aria-label={`Life score ${score} out of 100`}>
        <circle className="ring-track" cx="110" cy="110" r="94" />
        <circle
          className="ring-value"
          cx="110"
          cy="110"
          r="94"
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (score / 100) * circumference }}
        />
      </svg>
      <div className="ring-text">
        <strong data-testid="life-score-value" aria-live="polite">{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  return (
    <span className={`level-badge level-${level.toLowerCase()}`} data-testid={`risk-level-${level.toLowerCase()}`}>
      {level}
    </span>
  );
}

function AreaCard({ area, assessment }) {
  const [open, setOpen] = useState(false);
  const summary = getDimensionSummary(assessment, area.key);
  const recommendation = getRecommendation(area.key);

  return (
    <article
      className={`area-card ${open ? "open" : ""}`}
      data-testid={`life-area-card-${area.key}`}
    >
      <button
        type="button"
        className="area-card-header"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-testid={`area-expand-${area.key}`}
      >
        <div className="area-card-top">
          <span className="area-icon">{area.icon}</span>
          <span className="area-score" data-testid={`life-area-score-${area.key}`}>
            {summary.score}<small>/10</small>
          </span>
        </div>
        <h3>{area.label}</h3>
        <div className="meter"><span style={{ width: `${summary.score * 10}%` }} /></div>
        <p>{getInsight(summary.score)}</p>
        <span className="area-toggle">{open ? "Hide detail" : "See detail"}</span>
      </button>

      {open && (
        <div className="area-detail" data-testid={`area-detail-${area.key}`}>
          <div className="area-detail-row">
            <span className="area-detail-label">Friction points</span>
            <div className="chip-row">
              {summary.frictions.length === 0 && <span className="chip chip-muted">None selected</span>}
              {summary.frictions.map((friction) => (
                <span key={friction} className="chip" data-testid={`area-friction-${area.key}-${friction.toLowerCase().replace(/\s+/g, "-")}`}>
                  {friction}
                </span>
              ))}
            </div>
          </div>

          <div className="area-detail-row">
            <span className="area-detail-label">Signal</span>
            <div className="risk-inline">
              <LevelBadge level={summary.dimensionRisk.level} />
              <p>{summary.dimensionRisk.why}</p>
            </div>
          </div>

          <div className="area-detail-row">
            <span className="area-detail-label">Try this first</span>
            <p className="subaction" data-testid={`area-subaction-${area.key}`}>{recommendation.subaction}</p>
          </div>

          <div className="area-detail-row">
            <span className="area-detail-label">Curated sources</span>
            <ul className="source-list">
              {recommendation.sources.map((source, index) => (
                <li key={source.url} data-testid={`area-source-${area.key}-${index + 1}`}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                    {source.title}
                    <ExternalLink size={13} />
                  </a>
                  <p>{source.why}</p>
                  <div className="source-meta">
                    <span>{source.type}</span>
                    <span>·</span>
                    <span>{source.cost}</span>
                    <span>·</span>
                    <span>Checked {source.checked}</span>
                  </div>
                </li>
              ))}
            </ul>
            <small className="source-note">{recommendation.note}</small>
          </div>
        </div>
      )}
    </article>
  );
}

function TopOpportunities({ opportunities }) {
  return (
    <article className="opportunities-panel panel" data-testid="top-opportunities-section">
      <div className="panel-label"><span>02</span><b>Top opportunities</b><span>THE TWO CLEAREST LEVERS</span></div>
      <div className="opportunities-grid">
        {opportunities.map((op) => (
          <div key={op.area.key} className="opportunity-block" data-testid={`top-opportunity-${op.rank}`}>
            <div className="opportunity-rank">0{op.rank}</div>
            <div>
              <h3 data-testid={`top-opportunity-name-${op.rank}`}>{op.area.label}</h3>
              <span className="opportunity-meta">{op.score}/10 · room to grow</span>
              <p>{op.reason}</p>
            </div>
          </div>
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
      <span className="obstacle-note">Naming the friction reduces it. Every next action here works around this.</span>
    </article>
  );
}

function TwinPanel({ insights }) {
  return (
    <article className="twin-panel panel" data-testid="life-twin-section">
      <div className="panel-label"><span>04</span><b>Your AI Life Twin</b><Sparkles size={16} /></div>
      <h2>Patterns worth<br /><i>noticing.</i></h2>
      <p className="twin-subtitle">A rule-based read across your six dimensions</p>
      <ol>
        {insights.map((insight, index) => (
          <li key={insight} data-testid={`life-twin-insight-${index + 1}`}>
            <span>0{index + 1}</span>{insight}
          </li>
        ))}
      </ol>
      <small className="twin-disclaimer">Local, deterministic synthesis based on your answers. Not a real AI model or medical/financial opinion.</small>
    </article>
  );
}

function NextActionPanel({ action, completed, onMarkComplete }) {
  if (completed) {
    return (
      <article className="action-panel panel completed" data-testid="next-best-action-section">
        <div className="panel-label"><span>05</span><b>Your next best action</b><span>COMPLETE</span></div>
        <div className="action-content">
          <div className="action-mark"><Check size={28} /></div>
          <div>
            <p data-testid="next-action-label">One good move, made.</p>
            <h2 data-testid="next-action-text">Great! You&apos;ve completed your first Life Upgrade action.</h2>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="action-panel panel" data-testid="next-best-action-section">
      <div className="panel-label"><span>05</span><b>Your next best action</b><span>FOR TODAY</span></div>
      <div className="action-content">
        <div className="action-mark"><span>→</span></div>
        <div className="action-body">
          <p data-testid="next-action-label">Make it small. Make it real.</p>
          <h2 data-testid="next-action-text">{action.what}.</h2>
          <dl className="action-detail-grid">
            <div><dt>When</dt><dd data-testid="next-action-when">{action.when}</dd></div>
            <div><dt>How long</dt><dd data-testid="next-action-how">{action.how}</dd></div>
            <div className="action-why"><dt>Why</dt><dd data-testid="next-action-why">{action.why}</dd></div>
          </dl>
          <button className="primary-button" data-testid="next-action-complete-button" onClick={onMarkComplete}>
            Mark complete <Check size={17} />
          </button>
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
              <LevelBadge level={risk.level} />
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

function FutureScenarios({ scenarios, currentScore }) {
  return (
    <article className="future-panel panel" data-testid="future-self-section">
      <div className="panel-label"><span>08</span><b>Your future self</b><span>30 DAYS · 3 SCENARIOS</span></div>
      <p className="future-lede">
        A deterministic view of three trajectories from today&apos;s score of <strong data-testid="future-current-score">{currentScore}</strong>.
      </p>
      <div className="future-grid">
        {scenarios.map((scenario) => (
          <div key={scenario.key} className={`future-card future-${scenario.key}`} data-testid={`future-scenario-${scenario.key}`}>
            <span className="future-label">{scenario.label}</span>
            <div className="future-numbers">
              <span data-testid={`future-scenario-projected-${scenario.key}`}>{scenario.projected}</span>
              <b>{scenario.delta}</b>
            </div>
            <p>{scenario.note}</p>
          </div>
        ))}
      </div>
      <small className="future-disclaimer">Deterministic estimate. Not a prediction, guarantee, or scientific forecast.</small>
    </article>
  );
}

function ProgressPanel({ completed }) {
  return (
    <article className="progress-panel panel" data-testid="today-progress-section">
      <div className="panel-label"><span>06</span><b>Today&apos;s progress</b></div>
      <div className="progress-stat">
        <strong data-testid="today-progress-value" aria-live="polite">{completed ? "1 / 1" : "0 / 1"}</strong>
        <span>action completed</span>
      </div>
      <div className="progress-bar"><span style={{ width: completed ? "100%" : "0%" }} /></div>
      <div className="streak">
        <span>✦</span>
        <b data-testid="streak-value">{completed ? "1 Day" : "0 Days"}</b>
        <small>Keep the signal going.</small>
      </div>
    </article>
  );
}

export default function Dashboard({ data, onReset, setData }) {
  const { assessment, score, completed } = data;
  const lowest = getLowestArea(assessment.ratings);
  const opportunities = useMemo(() => getTopOpportunities(assessment), [assessment]);
  const twinInsights = useMemo(() => buildTwinInsights(assessment), [assessment]);
  const nextAction = useMemo(() => data.action || buildNextAction(assessment), [assessment, data.action]);
  const risks = useMemo(() => buildRiskRadar(assessment), [assessment]);
  const scenarios = useMemo(() => buildFutureScenarios(score, assessment), [score, assessment]);

  const markComplete = () => {
    const next = { ...data, completed: true };
    saveState(next);
    setData(next);
  };

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
        <article className="score-panel panel">
          <div className="panel-label"><span>01</span><b>Life score</b><span>AI-GENERATED / PERSONAL</span></div>
          <div className="score-panel-content">
            <ScoreRing score={score} />
            <div className="score-summary">
              <p className="score-kicker">A starting point, not a verdict.</p>
              <h2 data-testid="life-score-heading">YOUR LIFE SCORE</h2>
              <p>
                Based on your responses across six areas, your current shape is{" "}
                <strong>{score >= 70 ? "full of momentum" : score >= 50 ? "steady with clear room" : "ready for a reset"}</strong>.
              </p>
              <small data-testid="life-score-disclaimer">
                AI-generated personal assessment score based on your responses. Not scientifically validated.
              </small>
            </div>
          </div>
        </article>

        <TopOpportunities opportunities={opportunities} />
        <ObstaclePanel obstacles={assessment.obstacles} />
        <TwinPanel insights={twinInsights} />
        <NextActionPanel action={nextAction} completed={completed} onMarkComplete={markComplete} />
        <ProgressPanel completed={completed} />

        <section className="areas-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The six signals</p>
              <h2>Life areas</h2>
            </div>
            <span>TAP A CARD FOR DETAIL</span>
          </div>
          <div className="area-grid">
            {LIFE_AREAS.map((area) => (
              <AreaCard key={area.key} area={area} assessment={assessment} />
            ))}
          </div>
        </section>

        <RiskRadar risks={risks} />
        <FutureScenarios scenarios={scenarios} currentScore={score} />

        <footer className="dashboard-footer">
          <span>LIFE UPGRADE AI</span>
          <span>Biggest opportunity today · <b>{lowest.label}</b></span>
          <span>Know where you are. Know what to do next.</span>
        </footer>
      </section>
    </main>
  );
}
