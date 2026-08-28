// MediCheck AI provider
// Keeps the AI provider separate from the main MediCheck logic.
// GROQ_API_KEY is only accessed on the server.

export async function generateAIResponse(prompt) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Server is missing GROQ_API_KEY");
  }

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4
    })
  });

  if (!groqRes.ok) {
    const errText = await groqRes.text();
    console.error("Groq error:", errText);
    throw new Error("AI provider error");
  }

  const data = await groqRes.json();

  return data.choices?.[0]?.message?.content || "";
          }
