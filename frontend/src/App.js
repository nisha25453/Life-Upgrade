import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import "@/App.css";
import { blankAssessment } from "@/logic/assessmentModel";
import { buildNextAction, calculateScore } from "@/logic/intelligenceEngine";
import { clearState, loadState, saveState } from "@/logic/storage";
import Landing from "@/components/screens/Landing";
import Assessment from "@/components/screens/Assessment";
import Dashboard from "@/components/screens/Dashboard";

function Header({ onStart, onReset }) {
  return (
    <header className="site-header">
      <button className="wordmark" data-testid="brand-home-button" onClick={onReset}>
        <span className="wordmark-mark">+ </span>LIFE UPGRADE <em>AI</em>
      </button>
      <nav>
        <button data-testid="header-assessment-button" onClick={onStart}>
          Assessment <ArrowRight size={15} />
        </button>
      </nav>
    </header>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [assessment, setAssessment] = useState(blankAssessment);
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = loadState();
    if (stored) {
      setData(stored);
      setAssessment(stored.assessment);
      setScreen("dashboard");
    }
  }, []);

  const complete = () => {
    const score = calculateScore(assessment.ratings);
    const action = buildNextAction(assessment);
    const next = { assessment, score, action, completed: false };
    saveState(next);
    setData(next);
    setScreen("dashboard");
  };

  const reset = () => {
    clearState();
    setAssessment(blankAssessment);
    setData(null);
    setScreen("landing");
  };

  return (
    <div className="app-shell">
      <Header onStart={() => setScreen("assessment")} onReset={reset} />
      {screen === "landing" && <Landing onStart={() => setScreen("assessment")} />}
      {screen === "assessment" && (
        <Assessment
          assessment={assessment}
          setAssessment={setAssessment}
          onComplete={complete}
          onBack={() => setScreen("landing")}
        />
      )}
      {screen === "dashboard" && data && <Dashboard data={data} onReset={reset} setData={setData} />}
    </div>
  );
}
