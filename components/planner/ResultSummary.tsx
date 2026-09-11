import { formatKrw } from "@/lib/plan/budget";
import type { GeneratedPlan } from "@/lib/schemas/plan";

const relationshipLabel: Record<string, string> = { solo: "혼자", couple: "연인/커플", friends: "친구", parents: "부모님 동반", family_with_children: "아이 동반 가족" };
const fatigueLabel: Record<string, string> = { low: "낮음 (여유)", medium: "보통", high: "높음" };

export function ResultSummary({ plan }: { plan: GeneratedPlan }) {
  const { summary, input, budget } = plan;
  return (
    <section className="mt-5 rounded-3xl bg-gradient-to-r from-[#005d90] via-[#0077b6] to-sky-500 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">생성 완료 초안</p><p className="mt-3 text-sm text-sky-100">{input.departureDate} ~ {input.arrivalDate} · {summary.duration.nights}박 {summary.duration.days}일</p><h2 className="mt-1 text-2xl font-extrabold">{summary.title}</h2><p className="mt-2 text-sm text-sky-100">{input.travelerCount}명 · {relationshipLabel[input.relationship]} · {summary.destination}</p></div>
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-center text-xs backdrop-blur"><div><span className="block text-sky-200">총 예산</span><strong className="mt-1 block text-sm">{formatKrw(budget.allocatedTotalKrw)}</strong></div><div><span className="block text-sky-200">1인 참고</span><strong className="mt-1 block text-sm text-amber-200">{formatKrw(budget.perPerson.minKrw)}</strong></div><div><span className="block text-sky-200">이동 피로도</span><strong className="mt-1 block text-sm text-emerald-200">{fatigueLabel[summary.movementFatigue.level]}</strong></div></div>
      </div>
      <p className="mt-4 text-xs text-sky-100">{summary.movementFatigue.reason}</p>
    </section>
  );
}
