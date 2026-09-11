"use client";

import { useState } from "react";
import { formatKrw, getTravelerRange, recalculateBudget } from "@/lib/plan/budget";
import type { GeneratedPlan } from "@/lib/schemas/plan";

export function BudgetEditor({ plan, onChange }: { plan: GeneratedPlan; onChange: (next: GeneratedPlan) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");
  const { budget } = plan;
  const people = getTravelerRange(plan.input.travelerCount).min;

  function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const amountKrw = Number(formData.get("amountKrw"));
    if (!name || !Number.isInteger(amountKrw) || amountKrw < 0) { setEditError("항목명과 0원 이상의 정수 금액을 입력해주세요."); return; }
    const categories = budget.categories.map((category) => category.id === id ? { ...category, name, amountKrw, source: "user" as const } : category);
    const calculated = recalculateBudget(budget.totalBudgetKrw, plan.input.travelerCount, categories);
    onChange({ ...plan, budget: { ...budget, ...calculated, categories } });
    setEditingId(null);
    setEditError("");
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold text-slate-900">▤ 예상 예산 배분표</h3><p className="mt-1 text-xs text-slate-500">총 {formatKrw(budget.totalBudgetKrw)} 한도 내 배분</p></div><span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">추정치</span></div>{editError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{editError}</p>}<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[360px] text-left text-sm"><thead><tr className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500"><th className="px-3 py-3">항목</th><th className="px-3 py-3 text-right">총 금액</th><th className="px-3 py-3 text-right">1인 참고</th></tr></thead><tbody>{budget.categories.map((category) => <tr key={category.id} className="border-b border-slate-100">{editingId === category.id ? <td colSpan={3} className="p-3"><form onSubmit={(event) => save(event, category.id)} className="flex flex-wrap gap-2"><input name="name" defaultValue={category.name} className="min-w-28 flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm" /><input name="amountKrw" type="number" min="0" defaultValue={category.amountKrw} className="w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm" /><button className="rounded-lg bg-[#0077b6] px-3 py-2 text-xs font-bold text-white">저장</button><button type="button" onClick={() => { setEditingId(null); setEditError(""); }} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700">취소</button></form></td> : <><td className="px-3 py-3 font-semibold text-slate-800">{category.name} {category.source === "user" && <span className="ml-1 text-[10px] text-[#0077b6]">사용자 수정</span>}</td><td className="px-3 py-3 text-right font-bold text-slate-900">{formatKrw(category.amountKrw)}</td><td className="px-3 py-3 text-right text-slate-500">{formatKrw(Math.floor(category.amountKrw / people))}<button type="button" onClick={() => setEditingId(category.id)} className="ml-2 text-xs font-bold text-[#0077b6] hover:underline">수정</button></td></>}</tr>)}</tbody><tfoot><tr className="bg-sky-50 font-extrabold"><td className="px-3 py-3 text-slate-900">합계 / 잔여 예산</td><td className="px-3 py-3 text-right text-[#005d90]">{formatKrw(budget.allocatedTotalKrw)}</td><td className="px-3 py-3 text-right text-[#005d90]">{formatKrw(budget.remainingKrw)}</td></tr></tfoot></table></div><p className="mt-3 text-xs leading-5 text-slate-500">금액은 실시간 가격이 아닌 여행 계획을 위한 추정치입니다. 사용자 수정 금액도 별도 확인이 필요합니다.</p></section>
  );
}
