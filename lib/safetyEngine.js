// MediCheck Safety Engine
// This is a conservative safety layer, NOT a diagnostic system.
// It looks for clearly urgent warning signs before AI analysis.

const EMERGENCY_PATTERNS = [
  /\b(can'?t|cannot|unable to)\s+(breathe|breathing)\b/i,
  /\b(severe|serious)\s+(difficulty|trouble)\s+breathing\b/i,
  /\b(stopped breathing|not breathing)\b/i,

  /\b(severe|crushing|heavy)\s+chest\s+pain\b/i,
  /\bchest pain\b.*\b(severe|crushing|pressure)\b/i,

  /\b(unconscious|passed out|lost consciousness)\b/i,
  /\bnot responding\b/i,

  /\b(severe|uncontrolled|heavy)\s+bleeding\b/i,
  /\bbleeding\b.*\bwon'?t stop\b/i,

  /\bsigns?\s+of\s+(a\s+)?stroke\b/i,
  /\bpossible\s+stroke\b/i,

  /\bseizure\b.*\b(now|currently|ongoing)\b/i,
  /\bcurrently\s+having\s+a\s+seizure\b/i,

  /\bswelling\b.*\b(throat|tongue)\b.*\b(breathing|airway)\b/i,
  /\b(throat|tongue)\s+swelling\b.*\b(can'?t|cannot|difficulty)\s+breathe\b/i
];

export function checkSafety(symptoms) {
  const text = symptoms.trim();

  const matchedPatterns = EMERGENCY_PATTERNS.filter((pattern) =>
    pattern.test(text)
  );

  if (matchedPatterns.length > 0) {
    return {
      emergency: true,
      reason:
        "The description contains a possible emergency warning sign that should be assessed by a healthcare professional immediately."
    };
  }

  return {
    emergency: false,
    reason: null
  };
    }
