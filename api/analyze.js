import { generateAIResponse } from "../lib/aiProvider.js";
import { checkSafety } from "../lib/safetyEngine.js";

// Vercel serverless function.
// Safety checks happen before AI analysis.

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
  // SAFETY LAYER
  // --------------------------------------------------

  const safety = checkSafety(text);

  // If a possible emergency is detected,
  // do NOT send the request to the AI.
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
      disclaimer:
        "MediCheck AI is not a diagnosis and cannot replace assessment by a healthcare professional."
    });
  }

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

Return ONLY valid JSON in this exact shape:

{
  "urgency": "emergency" | "see_doctor_soon" | "monitor_at_home",
  "summary": "one calm sentence summarizing what was described",
  "possible_causes": ["short phrase", "short phrase", "short phrase"],
  "self_care": ["short actionable tip", "short actionable tip"],
  "red_flags": ["warning sign that should prompt urgent medical care", "another warning sign"],
  "disclaimer": "one sentence explaining that this is general information and not a diagnosis"
}

Important safety rules:

- Never claim certainty.
- Never diagnose.
- Never tell the user to ignore concerning symptoms.
- If the described symptoms sound potentially serious, recommend seeing a healthcare professional.
- If there is an immediate emergency, the user should contact local emergency services rather than relying on MediCheck AI.
`;

  try {
    const raw = await generateAIResponse(prompt);

    const clean = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    // Validate the AI response before returning it.
    const validUrgencies = [
      "emergency",
      "see_doctor_soon",
      "monitor_at_home"
    ];

    if (!validUrgencies.includes(parsed.urgency)) {
      throw new Error("Invalid urgency returned by AI");
    }

    if (typeof parsed.summary !== "string") {
      throw new Error("Invalid AI response");
    }

    if (!Array.isArray(parsed.possible_causes)) {
      throw new Error("Invalid AI response");
    }

    if (!Array.isArray(parsed.self_care)) {
      throw new Error("Invalid AI response");
    }

    if (!Array.isArray(parsed.red_flags)) {
      throw new Error("Invalid AI response");
    }

    if (typeof parsed.disclaimer !== "string") {
      throw new Error("Invalid AI response");
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error("MediCheck analysis error:", e);

    return res.status(500).json({
      error: "Failed to analyze symptoms"
    });
  }
}
