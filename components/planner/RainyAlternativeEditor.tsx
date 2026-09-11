"use client";

import { useState } from "react";
import type { GeneratedPlan } from "@/lib/schemas/plan";

export function RainyAlternativeEditor({ plan, onChange }: { plan: GeneratedPlan; onChange: (next: GeneratedPlan) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const replacementTitle = String(formData.get("replacementTitle") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!replacementTitle || !description) { setEditError("대안명과 설명을 모두 입력해주세요."); return; }
    onChange({ ...plan, rainyAlternatives: plan.rainyAlternatives.map((alternative) => alternative.id === id ? { ...alternative, replacementTitle, description, source: "user" } : alternative) });
    setEditingId(null);
    setEditError("");
  }

  return (
    <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">☂</span><div><h3 className="text-lg font-extrabold text-slate-900">우천 시 실내 대안 (Plan B)</h3><p className="text-xs font-medium text-indigo-700">실시간 예보가 아닌, 비가 올 때 참고할 대안입니다.</p></div></div>{editError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{editError}</p>}<div className="mt-4 space-y-3">{plan.rainyAlternatives.map((alternative) => { const original = plan.days.flatMap((day) => day.items).find((item) => item.id === alternative.originalItemId); return <article key={alternative.id} className="rounded-2xl border border-indigo-100 bg-white p-4">{editingId === alternative.id ? <form onSubmit={(event) => save(event, alternative.id)} className="space-y-2"><input name="replacementTitle" defaultValue={alternative.replacementTitle} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" /><textarea name="description" defaultValue={alternative.description} className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm" /><div className="flex gap-2"><button className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">저장</button><button type="button" onClick={() => { setEditingId(null); setEditError(""); }} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700">취소</button></div></form> : <><div className="flex gap-2"><div className="min-w-0 flex-1"><h4 className="text-sm font-bold text-slate-900">{original?.title ?? "야외 활동"} → {alternative.replacementTitle} {alternative.source === "user" && <span className="ml-1 text-[10px] text-[#0077b6]">사용자 수정</span>}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{alternative.description}</p></div><button type="button" onClick={() => setEditingId(alternative.id)} className="self-start text-xs font-bold text-indigo-700 hover:underline">수정</button></div></>}</article>; })}</div></section>
  );
}
