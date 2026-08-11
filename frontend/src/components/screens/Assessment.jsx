import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CONSISTENCY, LIFE_AREAS, OBSTACLES } from "@/logic/assessmentModel";
import { DEEP_DIVE, isDeepDiveComplete } from "@/logic/deepDiveQuestions";

const BASE_STEPS = [
  { key: "goal", label: "The intention" },
  { key: "areas", label: "Your focus" },
  { key: "ratings", label: "The temperature" },
  { key: "obstacle", label: "The friction" },
  { key: "consistency", label: "Your rhythm" },
];

const testId = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function DeepDiveField({ areaKey, field, value, onChange }) {
  const inputId = `deep-${areaKey}-${field.key}`;
  if (field.type === "text") {
    return (
      <div className="deep-field">
        <label htmlFor={inputId}>{field.label}</label>
        <input
          id={inputId}
          type="text"
          value={value || ""}
          placeholder={field.placeholder || ""}
          data-testid={`deep-input-${areaKey}-${field.key}`}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="deep-field">
        <label htmlFor={inputId}>{field.label}</label>
        <textarea
          id={inputId}
          rows={4}
          value={value || ""}
          placeholder={field.placeholder || ""}
          data-testid={`deep-input-${areaKey}-${field.key}`}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      </div>
    );
  }
  if (field.type === "radio") {
    return (
      <fieldset className="deep-field">
        <legend>{field.label}</legend>
        <div className="deep-radio-grid">
          {field.options.map((option) => (
            <label
              key={option}
              className={`deep-chip ${value === option ? "selected" : ""}`}
              data-testid={`deep-radio-${areaKey}-${field.key}-${testId(option)}`}
            >
              <input
                type="radio"
                name={`${areaKey}-${field.key}`}
                checked={value === option}
                onChange={() => onChange(field.key, option)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  if (field.type === "multi") {
    const list = value || [];
    return (
      <fieldset className="deep-field">
        <legend>{field.label}</legend>
        <div className="deep-multi-grid">
          {field.options.map((option) => {
            const active = list.includes(option);
            return (
              <label
                key={option}
                className={`deep-chip ${active ? "selected" : ""}`}
                data-testid={`deep-multi-${areaKey}-${field.key}-${testId(option)}`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onChange(field.key, active ? list.filter((v) => v !== option) : [...list, option])}
                />
                {option}
                {active && <Check size={14} />}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
  return null;
}

export default function Assessment({ assessment, setAssessment, onComplete, onBack }) {
  const [step, setStep] = useState(0);

  const steps = useMemo(() => {
    const deepDiveSteps = (assessment.selectedAreas || []).map((key) => ({ key: `deep-${key}`, label: DEEP_DIVE[key].label, area: key }));
    return [...BASE_STEPS, ...deepDiveSteps];
  }, [assessment.selectedAreas]);

  const totalSteps = steps.length;
  const current = steps[Math.min(step, totalSteps - 1)];

  const update = (key, value) => setAssessment((prev) => ({ ...prev, [key]: value }));
  const updateDeep = (areaKey, fieldKey, value) =>
    setAssessment((prev) => ({ ...prev, [areaKey]: { ...(prev[areaKey] || {}), [fieldKey]: value } }));

  const canContinue = (() => {
    if (current.key === "goal") return (assessment.goal || "").trim().length > 0;
    if (current.key === "areas") return (assessment.selectedAreas || []).length > 0;
    if (current.key === "ratings") return true;
    if (current.key === "obstacle") return !!assessment.obstacle;
    if (current.key === "consistency") return !!assessment.consistency;
    if (current.area) return isDeepDiveComplete(assessment, current.area);
    return true;
  })();

  const isLastStep = step === totalSteps - 1;
  const next = () => (isLastStep ? onComplete() : setStep(step + 1));
  const back = () => (step === 0 ? onBack() : setStep(step - 1));

  const humanIndex = String(step + 1).padStart(2, "0");
  const humanTotal = String(totalSteps).padStart(2, "0");

  return (
    <main className="assessment-page page-enter">
      <div className="assessment-heading">
        <button className="back-button" data-testid="assessment-back-button" onClick={back}>
          <ChevronLeft size={17} /> Back
        </button>
        <p className="eyebrow">Free AI life assessment</p>
        <span className="step-count" data-testid="assessment-step-count">
          {humanIndex} / {humanTotal}
        </span>
      </div>
      <div className="progress-line">
        <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>

      <section className="question-block">
        <p className="question-index" data-testid="assessment-question-label">
          {current.area ? "Deep dive" : `Question ${humanIndex}`}
        </p>
        <h2 data-testid="assessment-step-title">{current.label}</h2>

        {current.key === "goal" && (
          <div className="field-wrap">
            <label htmlFor="goal">What is your biggest goal right now?</label>
            <textarea
              id="goal"
              data-testid="assessment-goal-input"
              value={assessment.goal}
              onChange={(event) => update("goal", event.target.value)}
              placeholder="I want to improve my career, health, finances, productivity..."
              autoFocus
            />
          </div>
        )}

        {current.key === "areas" && (
          <fieldset>
            <legend>Which areas do you want to improve?</legend>
            <div className="option-grid">
              {LIFE_AREAS.map((area) => {
                const active = assessment.selectedAreas.includes(area.key);
                return (
                  <label
                    key={area.key}
                    className={`select-option ${active ? "selected" : ""}`}
                    data-testid={`area-select-${area.key}`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() =>
                        update(
                          "selectedAreas",
                          active ? assessment.selectedAreas.filter((k) => k !== area.key) : [...assessment.selectedAreas, area.key]
                        )
                      }
                    />
                    <span>{area.icon}</span>
                    {area.label}
                    <Check size={16} />
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {current.key === "ratings" && (
          <fieldset>
            <legend>Rate each area from 1–10.</legend>
            <div className="ratings-list">
              {LIFE_AREAS.map((area) => (
                <label className="rating-row" key={area.key} data-testid={`rating-row-${area.key}`}>
                  <span>
                    <b>{area.icon}</b>
                    {area.label}
                  </span>
                  <output data-testid={`rating-value-${area.key}`}>{assessment.ratings[area.key]}</output>
                  <input
                    aria-label={`${area.label} rating`}
                    data-testid={`rating-input-${area.key}`}
                    type="range"
                    min="1"
                    max="10"
                    value={assessment.ratings[area.key]}
                    onChange={(event) =>
                      update("ratings", { ...assessment.ratings, [area.key]: Number(event.target.value) })
                    }
                  />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {current.key === "obstacle" && (
          <fieldset>
            <legend>What is your biggest obstacle?</legend>
            <div className="choice-list">
              {OBSTACLES.map((item) => (
                <label
                  key={item}
                  className={`radio-option ${assessment.obstacle === item ? "selected" : ""}`}
                  data-testid={`obstacle-option-${testId(item)}`}
                >
                  <input
                    type="radio"
                    name="obstacle"
                    checked={assessment.obstacle === item}
                    onChange={() => update("obstacle", item)}
                  />
                  {item}
                  <span />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {current.key === "consistency" && (
          <fieldset>
            <legend>How consistent are you with your goals?</legend>
            <div className="consistency-grid">
              {CONSISTENCY.map((item, index) => (
                <label
                  key={item}
                  className={`consistency-option ${assessment.consistency === item ? "selected" : ""}`}
                  data-testid={`consistency-option-${testId(item)}`}
                >
                  <input
                    type="radio"
                    name="consistency"
                    checked={assessment.consistency === item}
                    onChange={() => update("consistency", item)}
                  />
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <b>{item}</b>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {current.area && (
          <div className="deep-block" data-testid={`deep-dive-step-${current.area}`}>
            <p className="deep-intro">{DEEP_DIVE[current.area].intro}</p>
            <div className="deep-fields">
              {DEEP_DIVE[current.area].fields.map((field) => (
                <DeepDiveField
                  key={field.key}
                  areaKey={current.area}
                  field={field}
                  value={assessment[current.area]?.[field.key]}
                  onChange={(fieldKey, value) => updateDeep(current.area, fieldKey, value)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="question-footer">
          <span>
            {isLastStep
              ? "Ready to map your pattern?"
              : current.area
                ? "Every honest answer sharpens the read."
                : "Take your time — this is just for you."}
          </span>
          <button
            className="primary-button"
            data-testid={isLastStep ? "generate-life-score-button" : "assessment-next-button"}
            disabled={!canContinue}
            onClick={next}
          >
            {isLastStep ? "Generate my life score" : "Continue"}
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
