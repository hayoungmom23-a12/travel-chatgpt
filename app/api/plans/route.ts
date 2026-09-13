import { NextResponse } from "next/server";
import { GeminiRequestFailure, generatePlan } from "@/lib/ai/generate-plan";
import { errorPayload, safeGenerationError } from "@/lib/errors";
import { tripInputSchema } from "@/lib/schemas/plan";
import { detectConditionConflict } from "@/lib/plan/conflict";

export const runtime = "nodejs";

function generationErrorResponse(requestId: string, error: unknown) {
  if (error instanceof Error && error.message === "GEMINI_API_KEY_MISSING") {
    return NextResponse.json(errorPayload(requestId, {
      code: "API_KEY_SETUP_REQUIRED",
      message: "Gemini API 키가 설정되지 않았습니다. .env 파일의 GEMINI_API_KEY 항목을 확인한 뒤 서버를 다시 시작해주세요.",
    }), { status: 503 });
  }

  if (error instanceof GeminiRequestFailure) {
    if ([401, 403].includes(error.status)) {
      return NextResponse.json(errorPayload(requestId, {
        code: "API_KEY_INVALID",
        message: "Gemini API 키를 사용할 수 없습니다. API 키 값과 프로젝트 권한을 확인해주세요.",
      }), { status: 502 });
    }
    if (error.status === 429) {
      return NextResponse.json(errorPayload(requestId, {
        code: "RATE_LIMITED",
        message: "Gemini 요청 한도에 도달했습니다. 생성 버튼을 여러 번 누르지 말고 잠시 기다린 뒤 한 번만 다시 시도해주세요.",
      }), { status: 429 });
    }
    if (error.status >= 500) {
      return NextResponse.json(errorPayload(requestId, {
        code: "GEMINI_UNAVAILABLE",
        message: "Gemini 서버가 일시적으로 응답하지 않고 있습니다. 잠시 후 다시 시도해주세요.",
      }), { status: 503 });
    }
  }

  if (error instanceof Error && error.message === "INVALID_MODEL_RESPONSE") {
    return NextResponse.json(errorPayload(requestId, {
      code: "INVALID_PLAN_RESPONSE",
      message: "Gemini가 여행 계획을 만들었지만 화면에 표시할 형식이 맞지 않았습니다. 잠시 후 다시 시도해주세요.",
    }), { status: 502 });
  }

  return NextResponse.json(errorPayload(requestId, safeGenerationError()), { status: 502 });
}

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
    return generationErrorResponse(requestId, error);
  }
}
