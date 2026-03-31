import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { retrieveRelevantChunks } from "./retrieval.js";
import { validationReview } from "./validation.js";


dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//Base AI call

async function generateReview(studentCode) {
    const docs = await retrieveRelevantChunks(studentCode, {
        topK: 5,
    });

    console.log("Retrieved docs: ", docs.length);

    const contextText = docs.map((d) => d.text).join("\n");

    const prompt = `
    You are an expert code reviewer.

    Analyze the student's code using the reference guidelines.

    Return ONLY valid JSON (no explanations).

    FORMAT:
    {
    "issues": [
        {
        "message": "string",
        "severity": "low | medium | high",
        "reference": "optional guideline"
        }
    ],
    "suggestions": ["string"],
    "score": number (0-10),
    "summary": "string"
    }

    STUDENT CODE:
    ${studentCode}

    GUIDELINES:
    ${contextText}
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-40-mini",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
    });

    let output = response.choices[0].message.content;

  try {
    
    output = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(output);
  } catch (err) {
    console.error("JSON parse failed: ", output);
    throw new Error("Invalid JSON from AI");
  }
}



// Retry + validation

export async function generateReviewWithRetry(studentCode, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      console.log(` Attempt ${i + 1}`);

      const result = await generateReview(studentCode);

      // Zod/manual validation
      const validation = validationReview(result);

      if (validation.success || validation.valid) {
        console.log("Valid AI response");
        return result;
      }

      console.log("Validation failed, retrying...", validation);

    } catch (err) {
      console.log(`Attempt ${i + 1} error:`, err.message);
    }
  }

  console.log("All retries failed");

  return {
    issues: [],
    suggestions: [],
    score: 0,
    summary: "Failed to generate valid AI review after retries",
  };

}

// --- Main Function
export async function reviewCode(studentCode) {
  // Retrieve relevant docs
  const docs = await retrieveRelevantChunks(studentCode, {
    topK: 5,
  });

  console.log(" Retrieved docs:", docs.length);

  const contextText = docs.map(d => d.text).join("\n");

  // Prompt
  const prompt = `
You are an expert code reviewer.

Analyze the student's code using the reference guidelines.

Return ONLY valid JSON (no explanations).

FORMAT:
{
  "issues": [
    {
      "message": "string",
      "severity": "low | medium | high",
      "reference": "optional guideline"
    }
  ],
  "suggestions": ["string"],
  "score": number (0-10),
  "summary": "string"
}

STUDENT CODE:
${studentCode}

GUIDELINES:
${contextText}
`;

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  let output = response.choices[0].message.content;

  // Parse JSON 
  try {
    // remove json if model adds it
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(output);
  } catch (err) {
    console.error("JSON parse failed:", output);

    return {
      issues: [],
      suggestions: [],
      score: 0,
      summary: "Failed to parse AI response",
    };
  }
}
