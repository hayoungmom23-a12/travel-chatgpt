import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai/generate-plan";
import { errorPayload, safeGenerationError } from "@/lib/errors";
import { tripInputSchema } from "@/lib/schemas/plan";
import { detectConditionConflict } from "@/lib/plan/conflict";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();
    const parsed = tripInputSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]));
      return NextResponse.json(errorPayload(requestId, { code: "VALIDATION_ERROR", message: "입력 조건을 다시 확인해주세요.", fieldErrors }), { status: 400 });
    }
    const conflict = detectConditionConflict(parsed.data);
    if (conflict) {
      return NextResponse.json(errorPayload(requestId, { code: "CONDITION_CONFLICT", message: conflict.message, proposals: conflict.proposals }), { status: 409 });
    }
    const plan = await generatePlan(parsed.data);
    return NextResponse.json({ requestId, status: "ok", plan });
  } catch (error) {
    if (error instanceof Error && error.message === "GEMINI_API_KEY_MISSING") {
      return NextResponse.json(errorPayload(requestId, { code: "GENERATION_FAILED", message: "생성 API 설정이 준비되지 않았습니다. 잠시 후 다시 시도하거나 조건을 수정해주세요." }), { status: 503 });
    }
    return NextResponse.json(errorPayload(requestId, safeGenerationError()), { status: 502 });
  }
}
