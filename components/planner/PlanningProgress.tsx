export function PlanningProgress({ destination }: { destination: string }) {
  const steps = ["입력 조건과 동행자 편의성 검토", "일자별 동선과 활동 구성", "항목별 예상 예산 배분", "준비물과 우천 대안 구성"];
  return (
    <section className="mt-5 rounded-3xl border border-sky-100 bg-white p-7 text-center shadow-sm" aria-live="polite">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-2xl text-[#0077b6]">✦</div>
      <h2 className="mt-4 text-xl font-extrabold text-slate-900">{destination || "여행"} 계획을 조율하고 있습니다</h2>
      <p className="mt-2 text-sm text-slate-500">조건을 반영한 초안을 만들고 있어요.</p>
      <ol className="mx-auto mt-6 max-w-md space-y-3 text-left">{steps.map((step, index) => <li key={step} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#0077b6] text-xs text-white">{index + 1}</span>{step}</li>)}</ol>
    </section>
  );
}
