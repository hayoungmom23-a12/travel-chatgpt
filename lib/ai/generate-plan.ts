import { z } from "zod";
import { createPlanInputMessage, planSystemInstructions } from "@/lib/ai/prompt";
import { generatedPlanSchema, type GeneratedPlan, type TripInput } from "@/lib/schemas/plan";
import { validateGeneratedPlan } from "@/lib/plan/validate-result";

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

const geminiSchemaKeys = new Set([
  "$id", "$defs", "$ref", "$anchor", "type", "format", "title", "description", "enum", "items", "prefixItems",
  "minItems", "maxItems", "minimum", "maximum", "anyOf", "oneOf", "properties", "additionalProperties", "required"
]);

function toGeminiResponseSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(toGeminiResponseSchema);
  if (!schema || typeof schema !== "object") return schema;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === "const") {
      result.enum = [value];
      continue;
    }
    if (!geminiSchemaKeys.has(key)) continue;
    if ((key === "properties" || key === "$defs") && value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = Object.fromEntries(Object.entries(value).map(([name, child]) => [name, toGeminiResponseSchema(child)]));
      continue;
    }
    if (key === "items" || key === "additionalProperties") {
      result[key] = toGeminiResponseSchema(value);
      continue;
    }
    result[key] = toGeminiResponseSchema(value);
  }
  return result;
}

export async function generatePlan(input: TripInput): Promise<GeneratedPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");

  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 45_000);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 45_000);
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: planSystemInstructions }] },
        contents: [{ role: "user", parts: [{ text: createPlanInputMessage(input) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: toGeminiResponseSchema(z.toJSONSchema(generatedPlanSchema))
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini GenerateContent request failed", { model, status: response.status });
      throw new Error("GEMINI_REQUEST_FAILED");
    }
    const payload = await response.json() as GeminiResponse;
    const outputText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    if (!outputText) throw new Error("EMPTY_MODEL_RESPONSE");
    try {
      return validateGeneratedPlan(JSON.parse(outputText), input);
    } catch {
      console.error("Gemini GenerateContent returned an invalid plan", { model });
      throw new Error("INVALID_MODEL_RESPONSE");
    }
  } catch (error) {
    if (error instanceof Error && error.message !== "GEMINI_REQUEST_FAILED" && error.message !== "INVALID_MODEL_RESPONSE") {
      console.error("Gemini GenerateContent call did not complete", { model, reason: error.message });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
