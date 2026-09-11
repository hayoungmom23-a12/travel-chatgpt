import { formatKrw } from "@/lib/plan/budget";
import type { GeneratedPlan } from "@/lib/schemas/plan";

export function createShareText(plan: GeneratedPlan) {
  const days = plan.days.map((day, index) => `${index + 1}일차 ${day.title}\n${day.items.map((item) => `- ${item.time} ${item.title}`).join("\n")}`).join("\n\n");
  return `[여정 AI 여행 계획]\n${plan.summary.title}\n${plan.input.departureDate} ~ ${plan.input.arrivalDate}\n예상 배분 금액: ${formatKrw(plan.budget.allocatedTotalKrw)} (추정치)\n\n${days}\n\n${plan.notices.join("\n")}`;
}

export async function sharePlan(plan: GeneratedPlan): Promise<"shared" | "copied" | "manual"> {
  const text = createShareText(plan);
  if (navigator.share) {
    await navigator.share({ title: plan.summary.title, text });
    return "shared";
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "manual";
  }
}
