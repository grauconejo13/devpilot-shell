import OpenAI from "openai";
import { retrieveRelevantChunks } from "../retrieval.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Core function

export async function reviewCode(studentCode, language = null) {
  const chunks = await retrieveRelevantChunks(studentCode, {
    language,
    topK: 5,
  });

  const context = chunks
    .map((c, i) => `Rule ${i + 1}: ${c.text}`)
    .join("\n");

  const prompt = `
You are a strict senior code reviewer.

You MUST return ONLY valid JSON.

Do NOT include explanations outside JSON.

------------------------------------

REFERENCE RULES:
${context}

------------------------------------

STUDENT CODE:
${studentCode}

------------------------------------

Return JSON in this EXACT format:

{
  "issues": [
    {
      "message": "string",
      "severity": "low | medium | high"
    }
  ],
  "suggestions": [
    "string"
  ],
  "score": number (0-10),
  "summary": "string"
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You are a strict JSON-only API.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.log("JSON parse failed, raw output:");
    console.log(text);

    return {
      issues: [],
      suggestions: [],
      score: 0,
      summary: "Failed to parse AI response",
    };
  }
}

// Retry Wrapper
export async function generateReviewWithRetry(
  studentCode,
  language = null,
  retries = 3
) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await reviewCode(studentCode, language);

      if (result && typeof result.score === "number") {
        return result;
      }

      throw new Error("Invalid AI response structure");
    } catch (err) {
      lastError = err;
      console.log(`Attempt ${i + 1} failed`);
    }
  }

  console.log("All retries failed:", lastError);

  return {
    issues: [],
    suggestions: [],
    score: 0,
    summary: "AI failed after multiple retry attempts",
  };
}
