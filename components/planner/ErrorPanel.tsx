"use client";

import type { ApiErrorCode, PlanApiError } from "@/lib/errors";

type ErrorPanelProps = {
  error: PlanApiError;
  onRetry: () => void;
  onEditConditions: () => void;
};

const errorDisplay: Record<ApiErrorCode, { label: string; title: string }> = {
  VALIDATION_ERROR: { label: "입력 확인", title: "입력 조건을 확인해주세요" },
  CONDITION_CONFLICT: { label: "조건 확인", title: "여행 조건을 함께 맞추기 어려워요" },
  API_KEY_SETUP_REQUIRED: { label: "API 키 설정", title: "Gemini API 키 설정이 필요해요" },
  API_KEY_INVALID: { label: "API 키 확인", title: "Gemini API 키를 확인해주세요" },
  RATE_LIMITED: { label: "요청 한도 도달", title: "잠시 기다린 뒤 다시 시도해주세요" },
  GEMINI_UNAVAILABLE: { label: "Gemini 일시 오류", title: "Gemini가 잠시 응답하지 않아요" },
  INVALID_PLAN_RESPONSE: { label: "계획 형식 오류", title: "여행 계획 형식을 다시 만들고 있어요" },
  GENERATION_FAILED: { label: "생성 오류", title: "여행 계획을 완성하지 못했어요" },
};

export function ErrorPanel({ error, onRetry, onEditConditions }: ErrorPanelProps) {
  const display = errorDisplay[error.code];

  return (
    <section className="mt-5 rounded-3xl border border-red-100 bg-white p-7 text-center shadow-sm" role="alert">
      <p className="text-sm font-bold text-red-700">{display.label}</p>
      <h2 className="mt-2 text-xl font-extrabold text-slate-900">{display.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{error.message}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">입력한 여행 조건은 그대로 보관되어 있습니다. 조건을 확인한 뒤 다시 만들 수 있어요.</p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onRetry} className="rounded-xl bg-[#0077b6] px-4 py-3 text-sm font-bold text-white hover:bg-[#005d90]">다시 시도하기</button>
        <button type="button" onClick={onEditConditions} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200">조건 수정하기</button>
      </div>
    </section>
  );
}
