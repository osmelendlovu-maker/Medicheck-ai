// MediCheck Question Engine
// Identifies useful missing information before AI analysis.
// This does NOT diagnose medical conditions.

const QUESTION_RULES = [
  {
    patterns: [
      /\bstomach\s+pain\b/i,
      /\babdominal\s+pain\b/i,
      /\bbelly\s+pain\b/i
    ],
    questions: [
      "Where in your abdomen is the pain?",
      "When did the pain start?",
      "How severe is the pain?",
      "Is the pain getting better, worse, or staying the same?",
      "Are you experiencing any other symptoms?"
    ]
  },

  {
    patterns: [
      /\bheadache\b/i,
      /\bmigraine\b/i
    ],
    questions: [
      "When did the headache start?",
      "How severe is it?",
      "Where on your head is the pain?",
      "Is this different from headaches you normally experience?",
      "Are you experiencing any other symptoms?"
    ]
  },

  {
    patterns: [
      /\bsore throat\b/i,
      /\bthroat pain\b/i
    ],
    questions: [
      "When did the sore throat start?",
      "How severe is it?",
      "Do you have a fever?",
      "Are you having difficulty swallowing?",
      "Are you experiencing any other symptoms?"
    ]
  },

  {
    patterns: [
      /\bcough\b/i
    ],
    questions: [
      "When did the cough start?",
      "Is the cough dry or producing mucus?",
      "How severe is the cough?",
      "Do you have a fever?",
      "Are you experiencing any difficulty breathing?"
    ]
  },

  {
    patterns: [
      /\brash\b/i,
      /\bskin\s+rash\b/i
    ],
    questions: [
      "When did the rash start?",
      "Where on your body is it?",
      "Is it itchy or painful?",
      "Has it been spreading?",
      "Are you experiencing any other symptoms?"
    ]
  }
];

export function getFollowUpQuestions(symptoms) {
  const text = symptoms.trim();

  for (const rule of QUESTION_RULES) {
    const matches = rule.patterns.some((pattern) => pattern.test(text));

    if (matches) {
      return rule.questions;
    }
  }

  return [
    "When did your symptoms start?",
    "How severe are your symptoms?",
    "Are your symptoms getting better, worse, or staying the same?",
    "Are you experiencing any other symptoms?"
  ];
    }
