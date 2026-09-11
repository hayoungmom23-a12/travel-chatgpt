"use client";

import { useState } from "react";
import type { GeneratedPlan } from "@/lib/schemas/plan";

const typeLabel: Record<string, string> = { activity: "활동", meal: "식사", transport: "이동", rest: "휴식" };
const typeColor: Record<string, string> = { activity: "bg-emerald-600", meal: "bg-amber-500", transport: "bg-[#0077b6]", rest: "bg-indigo-500" };

export function DayCourseEditor({ plan, onChange }: { plan: GeneratedPlan; onChange: (next: GeneratedPlan) => void }) {
  const [selectedDayId, setSelectedDayId] = useState(plan.days[0]?.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");
  const selectedDay = plan.days.find((day) => day.id === selectedDayId) ?? plan.days[0];

  function save(event: React.FormEvent<HTMLFormElement>, itemId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updated = { time: String(formData.get("time") ?? ""), title: String(formData.get("title") ?? "").trim(), description: String(formData.get("description") ?? "").trim() };
    if (!updated.title || !updated.description || !/^\d{2}:\d{2}$/.test(updated.time)) { setEditError("시간, 활동명, 설명을 모두 입력해주세요."); return; }
    const items = selectedDay.items.map((item) => item.id === itemId ? { ...item, ...updated, source: "user" as const } : item);
    if (items.some((item, index) => index > 0 && item.time < items[index - 1].time)) { setEditError("활동 시간은 같은 날짜 안에서 시간 순서대로 입력해주세요."); return; }
    onChange({ ...plan, days: plan.days.map((day) => day.id === selectedDay.id ? { ...day, items } : day) });
    setEditingId(null);
    setEditError("");
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div><h3 className="text-lg font-extrabold text-slate-900">⌁ 일자별 추천 코스</h3><p className="mt-1 text-xs text-slate-500">시간대별 핵심 활동, 식사 및 이동·휴식 여유</p></div><div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{plan.days.map((day, index) => <button key={day.id} type="button" onClick={() => { setSelectedDayId(day.id); setEditingId(null); setEditError(""); }} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${selectedDay.id === day.id ? "bg-[#0077b6] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}>{index + 1}일차</button>)}</div></div>{editError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{editError}</p>}<div className="mt-5 space-y-4 border-l-2 border-slate-200 pl-5">{selectedDay.items.map((item) => <article key={item.id} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className={`absolute -left-[31px] top-5 h-3.5 w-3.5 rounded-full border-2 border-white ${typeColor[item.type]}`} />{editingId === item.id ? <form onSubmit={(event) => save(event, item.id)} className="space-y-3"><div className="grid gap-2 sm:grid-cols-[100px_1fr]"><input name="time" type="time" defaultValue={item.time} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-bold" /><input name="title" defaultValue={item.title} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold" /></div><textarea name="description" defaultValue={item.description} className="min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm" /><div className="flex gap-2"><button className="rounded-lg bg-[#0077b6] px-3 py-2 text-xs font-bold text-white">저장</button><button type="button" onClick={() => { setEditingId(null); setEditError(""); }} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700">취소</button></div></form> : <><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><time className="text-sm font-extrabold text-[#0077b6]">{item.time}</time><h4 className="text-sm font-bold text-slate-900">{item.title} {item.source === "user" && <span className="ml-1 text-[10px] text-[#0077b6]">사용자 수정</span>}</h4></div><div className="flex items-center gap-2"><span className="rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-500">{typeLabel[item.type]}</span><button type="button" onClick={() => setEditingId(item.id)} className="text-xs font-bold text-[#0077b6] hover:underline">수정</button></div></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>{item.estimatedCostKrw !== undefined && <p className="mt-2 text-xs font-semibold text-amber-700">추정 비용 · 공식 채널 확인 필요</p>}</>}</article>)}</div></section>
  );
}
