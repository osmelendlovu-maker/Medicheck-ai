import { generateAIResponse } from "../lib/aiProvider.js";
import { checkSafety } from "../lib/safetyEngine.js";
import { getFollowUpQuestions } from "../lib/questionEngine.js";

// Vercel serverless function.
// Handles MediCheck requests on the server.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symptoms } = req.body || {};

  if (!symptoms || typeof symptoms !== "string") {
    return res.status(400).json({ error: "Missing symptoms" });
  }

  const text = symptoms.trim();

  // Prevent extremely large inputs.
  if (text.length > 2000) {
    return res.status(400).json({
      error: "Please keep your symptom description under 2000 characters."
    });
  }

  // --------------------------------------------------
  // MEDICHECK SAFETY LAYER
  // --------------------------------------------------

  const safety = checkSafety(text);
  const followUpQuestions =
  getFollowUpQuestions(text);
  // Emergency situations are handled before AI analysis.
  if (safety.emergency) {
    return res.status(200).json({
      urgency: "emergency",
      summary:
        "Your description contains a possible emergency warning sign.",
      possible_causes: [],
      self_care: [
        "Do not wait for an AI assessment if you believe this is an emergency.",
        "Seek immediate medical attention from your local emergency service or an appropriate healthcare facility."
      ],
      red_flags: [
        "The safety system detected a possible emergency warning sign."
      ],
      follow_up_questions: [],
      disclaimer:
        "MediCheck AI is not a diagnosis and cannot replace assessment by a healthcare professional."
    });
  }

  // --------------------------------------------------
  // MEDICHECK QUESTION ENGINE
  // --------------------------------------------------

  // --------------------------------------------------
  // AI ANALYSIS
  // --------------------------------------------------

  const prompt = `You are MediCheck AI, a general health information assistant, not a doctor.

Your job is to provide cautious, general health information based only on what the user describes.

You must NEVER claim to diagnose the user.

Do not say that the user definitely has a disease or condition.

If the information is insufficient, say so clearly.

Do not recommend prescription medicines or give medication dosages.

If symptoms could potentially be serious, recommend appropriate professional medical assessment.

Symptoms described:
"${text}"

MediCheck identified these follow-up questions that may help gather more useful information:
${JSON.stringify(followUpQuestions)}

Return ONLY valid JSON in this exact shape:

{
  "urgency": "emergency" | "see_doctor_soon" | "monitor_at_home",
  "summary": "one calm sentence summarizing what was described",
  "possible_causes": ["short phrase", "short phrase", "short phrase"],
  "self_care": ["short actionable tip", "short actionable tip"],
  "red_flags": ["warning sign that should prompt urgent medical care", "another warning sign"],
  "follow_up_questions": ["useful question", "useful question"],
  "disclaimer": "one sentence explaining that this is general information and not a diagnosis"
}

Important safety rules:

- Never claim certainty.
- Never diagnose.
- Never tell the user to ignore concerning symptoms.
- Never recommend prescription medication or medication dosages.
- If the described symptoms sound potentially serious, recommend seeing a healthcare professional.
- If there is an immediate emergency, the user should contact local emergency services rather than relying on MediCheck AI.
- Keep follow-up questions relevant to the symptoms.
`;

  try {
    const raw = await generateAIResponse(prompt);

    const clean = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    // --------------------------------------------------
    // RESPONSE VALIDATION
    // --------------------------------------------------

    const validUrgencies = [
      "emergency",
      "see_doctor_soon",
      "monitor_at_home"
    ];

    if (!validUrgencies.includes(parsed.urgency)) {
      throw new Error("Invalid urgency returned by AI");
    }

    if (typeof parsed.summary !== "string") {
      throw new Error("Invalid summary returned by AI");
    }

    if (!Array.isArray(parsed.possible_causes)) {
      throw new Error("Invalid possible_causes returned by AI");
    }

    if (!Array.isArray(parsed.self_care)) {
      throw new Error("Invalid self_care returned by AI");
    }

    if (!Array.isArray(parsed.red_flags)) {
      throw new Error("Invalid red_flags returned by AI");
    }

    if (!Array.isArray(parsed.follow_up_questions)) {
      parsed.follow_up_questions = followUpQuestions;
    }

    if (typeof parsed.disclaimer !== "string") {
      throw new Error("Invalid disclaimer returned by AI");
    }

    // MediCheck's own safety engine always wins.
    if (safety.emergency) {
      parsed.urgency = "emergency";
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error("MediCheck analysis error:", e);

    return res.status(500).json({
      error: "Failed to analyze symptoms"
    });
  }
}

