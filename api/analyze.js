import { generateAIResponse } from "../lib/aiProvider.js";

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

  const prompt = `You are MediCheck AI, a general health information assistant, not a doctor. A user describes symptoms and you give clear, careful, general information — never a diagnosis.

Symptoms described: "${symptoms}"

Respond ONLY with JSON, no preamble, no markdown fences, in this exact shape:
{
  "urgency": "emergency" | "see_doctor_soon" | "monitor_at_home",
  "summary": "one calm sentence summarizing what was described",
  "possible_causes": ["short phrase", "short phrase", "short phrase"],
  "self_care": ["short actionable tip", "short actionable tip"],
  "red_flags": ["symptom that would mean seek care immediately", "..."],
  "disclaimer": "one sentence reminding this is not a diagnosis and a doctor should confirm"
}

If anything described sounds like a medical emergency (e.g. chest pain, difficulty breathing, stroke signs, severe bleeding, loss of consciousness), set urgency to "emergency" and make red_flags prominent.`;

  try {
    const raw = await generateAIResponse(prompt);

    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "Failed to analyze symptoms"
    });
  }
}
