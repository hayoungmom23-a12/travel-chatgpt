import { generatedPlanSchema, type GeneratedPlan, type TripInput } from "@/lib/schemas/plan";

export function validateGeneratedPlan(value: unknown, input: TripInput): GeneratedPlan {
  const result = generatedPlanSchema.safeParse({ ...(value as object), input });
  if (!result.success) throw new Error("생성 결과 형식이 올바르지 않습니다.");

  const plan = result.data;
  const hasEstimateNotice = plan.notices.some((notice) => notice.includes("추정"));
  const hasVerificationNotice = plan.notices.some((notice) => notice.includes("확인"));
  if (!hasEstimateNotice || !hasVerificationNotice) throw new Error("추정치 안내가 누락되었습니다.");
  if (plan.days.length !== plan.summary.duration.days) throw new Error("여행 일수와 일자별 코스가 일치하지 않습니다.");
  return plan;
}
