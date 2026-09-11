"use client";

import { useState } from "react";
import { PlanningProgress } from "./PlanningProgress";
import { ResultSummary } from "./ResultSummary";
import { DayCourseEditor } from "./DayCourseEditor";
import { BudgetEditor } from "./BudgetEditor";
import { NoticePanel } from "./NoticePanel";
import { ChecklistEditor } from "./ChecklistEditor";
import { RainyAlternativeEditor } from "./RainyAlternativeEditor";
import { ResultActions } from "./ResultActions";
import { TripForm } from "./TripForm";
import { ConflictPanel } from "./ConflictPanel";
import { ErrorPanel } from "./ErrorPanel";
import { defaultTripInput, type GeneratedPlan, type TripInput } from "@/lib/schemas/plan";
import type { PlanApiError } from "@/lib/errors";
import { applyConflictProposal } from "@/lib/plan/conflict";

type ViewState = "input" | "processing" | "result" | "conflict" | "error";

export function PlannerShell() {
  const [view, setView] = useState<ViewState>("input");
  const [draft, setDraft] = useState<TripInput>(defaultTripInput);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [conflict, setConflict] = useState<PlanApiError | null>(null);

  async function handleSubmit(values: TripInput) {
    setDraft(values);
    setErrorMessage("");
    setConflict(null);
    setView("processing");
    try {
      const response = await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json().catch(() => null) as { status: string; plan?: GeneratedPlan; error?: PlanApiError } | null;
      if (data?.status === "error" && data.error?.code === "CONDITION_CONFLICT") {
        setConflict(data.error);
        setView("conflict");
        return;
      }
      if (!response.ok || data?.status !== "ok" || !data.plan) throw new Error(data?.error?.message || "여행 계획을 만들지 못했습니다. 잠시 후 다시 시도하거나 조건을 수정해주세요.");
      setPlan(data.plan);
      setView("result");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "여행 계획을 만들지 못했습니다.");
      setView("error");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <section className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0077b6] text-xl text-white shadow-lg">✦</div><div><p className="text-lg font-extrabold tracking-tight text-slate-950">여정 AI</p><p className="text-sm font-medium text-[#0077b6]">맞춤 여행 계획 에이전트</p></div></header>
        <div className="rounded-3xl bg-gradient-to-br from-[#005d90] to-[#0077b6] p-7 text-white shadow-xl"><p className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">2분 안에 완성하는 초안</p><h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">조건만 넣으면 동선, 예산,<br />날씨 대안까지 한눈에</h1><p className="mt-3 text-sm text-sky-100">여행지부터 입력해 나만의 여행 계획을 시작하세요.</p></div>
        {view === "input" && <TripForm key={JSON.stringify(draft)} initialValues={draft} onSubmit={handleSubmit} />}
        {view === "processing" && <PlanningProgress destination={draft.destination} />}
        {view === "conflict" && conflict && <ConflictPanel conflict={conflict} onEditConditions={() => setView("input")} onApplyProposal={(proposal) => handleSubmit(applyConflictProposal(draft, proposal.type))} />}
        {view === "result" && plan && <><ResultSummary plan={plan} /><div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><DayCourseEditor plan={plan} onChange={setPlan} /><BudgetEditor plan={plan} onChange={setPlan} /></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><ChecklistEditor plan={plan} onChange={setPlan} /><RainyAlternativeEditor plan={plan} onChange={setPlan} /></div><div className="mt-5"><NoticePanel notices={plan.notices} /></div><div className="mt-5"><ResultActions plan={plan} onEditConditions={() => setView("input")} onOpenSaved={(savedPlan) => { setPlan(savedPlan); setDraft(savedPlan.input); setView("result"); }} /></div></>}
        {view === "error" && <ErrorPanel message={errorMessage} onRetry={() => handleSubmit(draft)} onEditConditions={() => setView("input")} />}
      </section>
    </main>
  );
}
