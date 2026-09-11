import type { PlanApiError } from "@/lib/errors";

export function ConflictPanel({ conflict, onEditConditions, onApplyProposal }: { conflict: PlanApiError; onEditConditions: () => void; onApplyProposal: (proposal: NonNullable<PlanApiError["proposals"]>[number]) => void }) {
  return (
    <section className="mt-5 rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8"><p className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">조건 충돌 감지</p><h2 className="mt-3 text-xl font-extrabold text-slate-900">여행 조건을 다시 확인해주세요</h2><p className="mt-2 text-sm leading-6 text-slate-600">{conflict.message}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{conflict.proposals?.map((proposal) => <button key={proposal.type} type="button" onClick={() => onApplyProposal(proposal)} className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-left text-sm font-bold text-[#005d90] hover:border-[#0077b6]"><span className="block text-xs text-sky-700">추천 조정안</span><span className="mt-1 block">{proposal.label}</span></button>)}</div><button type="button" onClick={onEditConditions} className="mt-5 text-sm font-bold text-slate-600 hover:underline">← 조건 직접 다시 수정하기</button></section>
  );
}
