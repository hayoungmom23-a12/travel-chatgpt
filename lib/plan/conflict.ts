import { getTripDuration } from "@/lib/plan/dates";
import { getTravelerRange } from "@/lib/plan/budget";
import type { TripInput } from "@/lib/schemas/plan";

export type ConflictProposalType = "increase_budget" | "shorten_schedule";

export function detectConditionConflict(input: TripInput) {
  const duration = getTripDuration(input.departureDate, input.arrivalDate);
  if (!duration) return null;
  const travelers = getTravelerRange(input.travelerCount).min;
  const suggestedBudgetKrw = duration.days * travelers * 60_000;
  if (input.totalBudgetKrw >= suggestedBudgetKrw) return null;
  return {
    message: `입력한 예산으로 ${duration.nights}박 ${duration.days}일 일정을 구성하기 어렵습니다. 제안 금액은 실시간 최저가가 아닌 계획용 추정 기준입니다.`,
    proposals: [
      { type: "increase_budget" as const, label: `예산을 ${suggestedBudgetKrw.toLocaleString("ko-KR")}원으로 조정해 다시 만들기` },
      { type: "shorten_schedule" as const, label: "일정을 당일치기 코스로 줄여 다시 만들기" }
    ]
  };
}

export function applyConflictProposal(input: TripInput, proposalType: ConflictProposalType): TripInput {
  if (proposalType === "shorten_schedule") {
    return { ...input, arrivalDate: input.departureDate };
  }

  const duration = getTripDuration(input.departureDate, input.arrivalDate);
  if (!duration) return input;
  const travelers = getTravelerRange(input.travelerCount).min;
  return { ...input, totalBudgetKrw: duration.days * travelers * 60_000 };
}
