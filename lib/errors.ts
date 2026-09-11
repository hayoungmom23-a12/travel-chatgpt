export type ApiErrorCode = "VALIDATION_ERROR" | "CONDITION_CONFLICT" | "RATE_LIMITED" | "GENERATION_FAILED";

export type PlanApiError = {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  proposals?: Array<{ type: "increase_budget" | "shorten_schedule"; label: string }>;
};

export function errorPayload(requestId: string, error: PlanApiError) {
  return { requestId, status: "error" as const, error };
}

export function safeGenerationError() {
  return { code: "GENERATION_FAILED" as const, message: "여행 계획을 만들지 못했습니다. 잠시 후 다시 시도하거나 조건을 수정해주세요." };
}
