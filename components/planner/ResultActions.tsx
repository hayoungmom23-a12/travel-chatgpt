"use client";

import { useEffect, useState } from "react";
import { createExternalMapSearchUrl } from "@/lib/maps/external-search";
import { loadSavedPlans, savePlan, type SavedPlan } from "@/lib/storage/saved-plans";
import { createShareText, sharePlan } from "@/lib/share/plan-share";
import type { GeneratedPlan } from "@/lib/schemas/plan";

export function ResultActions({ plan, onEditConditions, onOpenSaved }: { plan: GeneratedPlan; onEditConditions: () => void; onOpenSaved: (plan: GeneratedPlan) => void }) {
  const places = plan.days.flatMap((day) => day.items.map((item) => ({ id: item.id, label: item.title })));
  const [placeId, setPlaceId] = useState(places[0]?.id ?? "");
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [notice, setNotice] = useState("");
  const selectedPlace = places.find((place) => place.id === placeId);

  useEffect(() => setSavedPlans(loadSavedPlans()), []);
  function openMap() { if (selectedPlace) window.open(createExternalMapSearchUrl(plan.summary.destination, selectedPlace.label), "_blank", "noopener,noreferrer"); }
  function saveCurrentPlan() { try { const saved = savePlan(plan); setSavedPlans((current) => [saved, ...current].slice(0, 10)); setNotice("이 기기에 일정을 보관했습니다."); } catch { setNotice("이 기기에서 일정을 보관할 수 없습니다."); } }
  async function shareCurrentPlan() { try { const result = await sharePlan(plan); setNotice(result === "shared" ? "공유 창을 열었습니다." : result === "copied" ? "공유 내용을 복사했습니다." : createShareText(plan)); } catch { setNotice("공유가 취소되었거나 사용할 수 없습니다."); } }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">{notice && <p className="whitespace-pre-wrap rounded-xl bg-sky-50 p-3 text-xs font-bold text-[#005d90]">{notice}</p>}<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex flex-wrap items-center gap-2"><select value={placeId} onChange={(event) => setPlaceId(event.target.value)} className="max-w-56 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"><option value="">장소 선택</option>{places.map((place) => <option key={place.id} value={place.id}>{place.label}</option>)}</select><button type="button" disabled={!selectedPlace} onClick={openMap} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-[#0077b6] disabled:text-slate-400">⌖ 지도에서 확인</button></div><div className="flex flex-wrap gap-2"><button type="button" onClick={shareCurrentPlan} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">↗ 일정 공유</button><button type="button" onClick={saveCurrentPlan} className="rounded-xl bg-[#0077b6] px-3 py-2 text-sm font-bold text-white">▣ 내 일정 보관</button><button type="button" onClick={onEditConditions} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">↶ 조건 수정</button></div></div>{savedPlans.length > 0 && <div className="border-t border-slate-100 pt-3"><p className="mb-2 text-xs font-bold text-slate-500">이 기기에 보관한 일정</p><div className="flex flex-wrap gap-2">{savedPlans.map((saved) => <button key={saved.id} type="button" onClick={() => onOpenSaved(saved.plan)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">{saved.plan.summary.title}</button>)}</div></div>}</div>
  );
}
