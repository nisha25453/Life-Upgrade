import { ArrowRight } from "lucide-react";

export default function Landing({ onStart }) {
  return (
    <main className="landing page-enter">
      <section className="hero-copy">
        <p className="eyebrow">
          A personal operating system for your life <span>01 / 05</span>
        </p>
        <h1>
          Know where<br />
          <i>you are.</i><br />
          Know what<br />
          <i>to do next.</i>
        </h1>
        <p className="hero-description">
          A calm, personal starting point for improving the areas of life that matter most —
          Health, Career, Money, Productivity, Learning, and Relationships.
        </p>
        <button className="primary-button" data-testid="assessment-start-button" onClick={onStart}>
          Start my free AI life assessment <ArrowRight size={18} />
        </button>
      </section>
      <aside className="score-specimen" aria-label="Life score preview" data-testid="landing-score-preview">
        <div className="specimen-top">
          <span>YOUR LIFE SCORE</span>
          <span>06 areas</span>
        </div>
        <div className="score-orbit">
          <div className="orbit-ring">
            <strong>76</strong>
            <small>/ 100</small>
          </div>
          <span className="orbit-label label-one">CAREER <b>74</b></span>
          <span className="orbit-label label-two">HEALTH <b>82</b></span>
          <span className="orbit-label label-three">MONEY <b>69</b></span>
        </div>
        <p>See the shape of your life<br />before choosing your next move.</p>
      </aside>
      <div className="hero-foot">
        <span>NO ACCOUNT REQUIRED</span>
        <span>LOCAL & PRIVATE</span>
        <span>DETERMINISTIC · MOCKED AI</span>
      </div>
    </main>
  );
}
