// MediCheck Safety Engine
// Conservative emergency screening only.
// This does NOT diagnose medical conditions.

const EMERGENCY_PATTERNS = [
  // Breathing emergencies
  /\b(can'?t|cannot|unable to)\s+(breathe|breathing)\b/i,
  /\b(severe|serious)\s+(difficulty|trouble)\s+breathing\b/i,
  /\b(stopped breathing|not breathing)\b/i,
  /\bturning\s+blue\b/i,
  /\bblue\s+(lips|face)\b/i,

  // Serious chest symptoms
  /\b(severe|crushing|heavy)\s+chest\s+pain\b/i,
  /\bchest\s+pain\b.*\b(severe|crushing|pressure)\b/i,
  /\bchest\s+pressure\b.*\b(severe|heavy)\b/i,

  // Consciousness / responsiveness
  /\b(unconscious|passed out|lost consciousness)\b/i,
  /\bnot responding\b/i,
  /\b(can'?t|cannot)\s+wake\s+(up|them)\b/i,

  // Severe bleeding
  /\b(severe|uncontrolled|heavy)\s+bleeding\b/i,
  /\bbleeding\b.*\b(won'?t|will not)\s+stop\b/i,

  // Stroke warning
  /\bsigns?\s+of\s+(a\s+)?stroke\b/i,
  /\bpossible\s+stroke\b/i,
  /\b(face|arm|leg)\s+weakness\b.*\b(sudden|suddenly)\b/i,
  /\bsudden\s+(face|arm|leg)\s+(weakness|numbness)\b/i,
  /\bsudden\s+trouble\s+speaking\b/i,

  // Seizure
  /\bcurrently\s+having\s+a\s+seizure\b/i,
  /\bongoing\s+seizure\b/i,
  /\bseizure\b.*\b(now|currently|ongoing)\b/i,

  // Severe allergic reaction / airway swelling
  /\b(throat|tongue)\s+swelling\b.*\b(breathe|breathing|airway)\b/i,
  /\b(swollen|swelling)\s+(throat|tongue)\b.*\b(can'?t|cannot|difficulty)\b/i,

  // Major injury
  /\bmajor\s+(head|neck|spinal)\s+injury\b/i,
  /\bsevere\s+head\s+injury\b/i,

  // Severe sudden neurological symptoms
  /\bsudden\s+loss\s+of\s+vision\b/i,
  /\bsudden\s+confusion\b/i,
  /\bsudden\s+inability\s+to\s+speak\b/i
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
