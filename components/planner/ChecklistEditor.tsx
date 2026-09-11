"use client";

import { useState } from "react";
import type { GeneratedPlan } from "@/lib/schemas/plan";

export function ChecklistEditor({ plan, onChange }: { plan: GeneratedPlan; onChange: (next: GeneratedPlan) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [editError, setEditError] = useState("");

  function updateChecklist(nextChecklist: GeneratedPlan["checklist"]) { onChange({ ...plan, checklist: nextChecklist }); }
  function toggle(id: string) { updateChecklist(plan.checklist.map((item) => item.id === id ? { ...item, checked: !item.checked } : item)); }
  function save(event: React.FormEvent<HTMLFormElement>, id: string) { event.preventDefault(); const label = String(new FormData(event.currentTarget).get("label") ?? "").trim(); if (!label) { setEditError("준비물 이름을 입력해주세요."); return; } updateChecklist(plan.checklist.map((item) => item.id === id ? { ...item, label, source: "user" } : item)); setEditingId(null); setEditError(""); }
  function add() { const label = newLabel.trim(); if (!label || plan.checklist.some((item) => item.label === label)) { setEditError("비어 있거나 이미 있는 준비물입니다."); return; } updateChecklist([...plan.checklist, { id: crypto.randomUUID(), label, checked: false, source: "user" }]); setNewLabel(""); setEditError(""); }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold text-slate-900">☑ 준비물 체크리스트</h3><span className="text-xs text-slate-500">수정 가능</span></div>{editError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{editError}</p>}<div className="mt-4 grid gap-2 sm:grid-cols-2">{plan.checklist.map((item) => editingId === item.id ? <form key={item.id} onSubmit={(event) => save(event, item.id)} className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-2"><input name="label" defaultValue={item.label} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-sm" /><button className="text-xs font-bold text-[#0077b6]">저장</button><button type="button" onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-500">취소</button></form> : <div key={item.id} className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)} className="mr-3 h-4 w-4 accent-[#0077b6]" /><span className={`min-w-0 flex-1 ${item.checked ? "text-slate-400 line-through" : ""}`}>{item.label} {item.source === "user" && <em className="ml-1 text-[10px] not-italic text-[#0077b6]">사용자 수정</em>}</span><button type="button" onClick={() => setEditingId(item.id)} className="ml-2 text-xs text-[#0077b6]">수정</button><button type="button" onClick={() => updateChecklist(plan.checklist.filter((current) => current.id !== item.id))} className="ml-2 text-xs text-red-500">삭제</button></div>)}</div><div className="mt-3 flex gap-2"><input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm" placeholder="준비물 추가" /><button type="button" onClick={add} className="rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-800">추가</button></div></section>
  );
}
