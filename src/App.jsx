import React, { useState, useEffect } from "react";
import { Activity, AlertTriangle, Lock, Send, ChevronRight, ShieldAlert, History, X } from "lucide-react";

// Replace with your real Lemon Squeezy checkout link before going live
const LEMONSQUEEZY_CHECKOUT_URL = "https://your-store.lemonsqueezy.com/checkout/buy/your-product-id";
const FREE_CHECKS_PER_DAY = 3;
const PLUS_PRICE = "R49/month";
const PLUS_BENEFITS = [
  "Unlimited symptom checks, no daily cap",
  "Full history saved and searchable, not just your last 10",
  "Priority AI analysis with more detailed guidance",
  "Early access to new features as they ship"
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage() {
  try {
    const raw = localStorage.getItem("medicheck-usage");
    const parsed = raw ? JSON.parse(raw) : { date: todayKey(), count: 0 };
    return parsed.date === todayKey() ? parsed : { date: todayKey(), count: 0 };
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem("medicheck-history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [symptoms, setSymptoms] = useState("");
  const [screen, setScreen] = useState("home");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(loadUsage());
  const [history, setHistory] = useState(loadHistory());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem("medicheck-usage", JSON.stringify(usage));
  }, [usage]);

  useEffect(() => {
    localStorage.setItem("medicheck-history", JSON.stringify(history));
  }, [history]);

  const remaining = Math.max(0, FREE_CHECKS_PER_DAY - usage.count);

  async function runCheck() {
    if (!symptoms.trim()) return;
    if (remaining <= 0) {
      setScreen("paywall");
      return;
    }
    setError("");
    setScreen("loading");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms })
      });

      if (!res.ok) throw new Error("Request failed");
      const parsed = await res.json();

      setResult(parsed);
      setScreen("result");
      setUsage({ date: todayKey(), count: usage.count + 1 });

      const entry = { date: new Date().toISOString(), symptoms, summary: parsed.summary, urgency: parsed.urgency };
      setHistory([entry, ...history].slice(0, 10));
    } catch (e) {
      console.error(e);
      setError("Something went wrong reaching the AI. Please try again.");
      setScreen("home");
    }
  }

  const urgencyStyles = {
    emergency: { color: "#E85D5D", bg: "rgba(232,93,93,0.12)", label: "Seek care now" },
    see_doctor_soon: { color: "#F0A868", bg: "rgba(240,168,104,0.12)", label: "See a doctor soon" },
    monitor_at_home: { color: "#4FD1C5", bg: "rgba(79,209,197,0.12)", label: "Monitor at home" }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Activity size={22} color="#4FD1C5" />
          <span className="display-font">MediCheck AI</span>
        </div>
        <button className="icon-btn" onClick={() => setShowHistory(true)}>
          <History size={18} color="#8B98AC" />
        </button>
      </header>

      <div className="usage-wrap">
        <div className="usage-row mono-font">
          <span>FREE CHECKS TODAY</span>
          <span>{remaining} / {FREE_CHECKS_PER_DAY}</span>
        </div>
        <div className="usage-track">
          <div className="usage-fill" style={{ width: `${(remaining / FREE_CHECKS_PER_DAY) * 100}%` }} />
        </div>
      </div>

      <main>
        {screen === "home" && (
          <>
            <h1 className="display-font">What's going on?</h1>
            <p className="subtext">
              Describe your symptoms in your own words. MediCheck AI gives general guidance — it never replaces a doctor.
            </p>

            <textarea
              className="symptom-input"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I've had a sore throat and mild fever since yesterday..."
              rows={6}
            />

            {error && (
              <div className="error-row">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button className="btn-primary" disabled={!symptoms.trim()} onClick={runCheck}>
              <Send size={16} />
              Check my symptoms
            </button>

            <div className="notice">
              <ShieldAlert size={16} color="#F0A868" style={{ marginTop: 2, flexShrink: 0 }} />
              <p>
                If you're having chest pain, trouble breathing, severe bleeding, or think this is an emergency,
                contact local emergency services immediately — don't wait on an AI check.
              </p>
            </div>
          </>
        )}

        {screen === "loading" && (
          <div className="loading-wrap">
            <svg width="220" height="60" viewBox="0 0 240 60">
              <polyline
                className="pulse-path"
                points="0,30 40,30 55,10 70,50 85,30 240,30"
                fill="none"
                stroke="#4FD1C5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="loading-label mono-font">ANALYZING SYMPTOMS...</p>
          </div>
        )}

        {screen === "result" && result && (
          <>
            <div
              className="urgency-card"
              style={{
                backgroundColor: urgencyStyles[result.urgency]?.bg,
                borderColor: urgencyStyles[result.urgency]?.color
              }}
            >
              <div className="urgency-label mono-font" style={{ color: urgencyStyles[result.urgency]?.color }}>
                <Activity size={14} />
                {urgencyStyles[result.urgency]?.label.toUpperCase()}
              </div>
              <p className="urgency-summary">{result.summary}</p>
            </div>

            <Section title="Possible causes to discuss with a doctor" items={result.possible_causes} color="#4FD1C5" />
            <Section title="Self-care in the meantime" items={result.self_care} color="#4FD1C5" />
            {result.red_flags?.length > 0 && (
              <Section title="Seek care immediately if you notice" items={result.red_flags} color="#E85D5D" />
            )}

            <p className="disclaimer">{result.disclaimer}</p>

            <div className="upgrade-card">
              <div className="upgrade-head">
                <span className="display-font">MediCheck AI Plus</span>
                <span className="upgrade-price mono-font">{PLUS_PRICE}</span>
              </div>
              <ul>
                {PLUS_BENEFITS.map((b, i) => (
                  <li key={i}><span style={{ color: "#4FD1C5" }}>●</span><span>{b}</span></li>
                ))}
              </ul>
              <button className="btn-primary" style={{ marginTop: 0, width: "100%" }} onClick={() => window.open(LEMONSQUEEZY_CHECKOUT_URL, "_blank")}>
                Upgrade to Plus <ChevronRight size={16} />
              </button>
            </div>

            <button
              className="btn-secondary"
              onClick={() => { setScreen("home"); setSymptoms(""); setResult(null); }}
            >
              New check
            </button>
          </>
        )}

        {screen === "paywall" && (
          <div className="paywall">
            <div className="paywall-icon"><Lock size={24} color="#4FD1C5" /></div>
            <h2 className="display-font">You're out of free checks today</h2>
            <p className="paywall-sub">Upgrade to MediCheck AI Plus — {PLUS_PRICE} — for:</p>
            <ul>
              {PLUS_BENEFITS.map((b, i) => (
                <li key={i}><span style={{ color: "#4FD1C5" }}>●</span><span>{b}</span></li>
              ))}
            </ul>
            <button className="btn-primary" style={{ width: "100%", marginTop: 0 }} onClick={() => window.open(LEMONSQUEEZY_CHECKOUT_URL, "_blank")}>
              Upgrade now <ChevronRight size={16} />
            </button>
            <button className="link-btn" onClick={() => setScreen("home")}>
              Maybe later — I'll wait until tomorrow
            </button>
          </div>
        )}
      </main>

      {showHistory && (
        <div className="drawer-overlay" onClick={() => setShowHistory(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h3 className="display-font">Recent checks</h3>
              <button className="icon-btn" onClick={() => setShowHistory(false)}>
                <X size={16} color="#8B98AC" />
              </button>
            </div>
            {history.length === 0 && <p className="empty-text">No checks yet.</p>}
            {history.map((h, i) => (
              <div key={i} className="history-item">
                <p className="date mono-font">{new Date(h.date).toLocaleDateString()}</p>
                <p className="summary">{h.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, items, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="section">
      <p className="section-title mono-font" style={{ color }}>{title.toUpperCase()}</p>
      <ul>
        {items.map((item, i) => (
          <li key={i}><span className="dot" style={{ color }}>●</span><span>{item}</span></li>
        ))}
      </ul>
    </div>
  );
    }
