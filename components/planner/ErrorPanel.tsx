"use client";

type ErrorPanelProps = {
  message: string;
  onRetry: () => void;
  onEditConditions: () => void;
};

export function ErrorPanel({ message, onRetry, onEditConditions }: ErrorPanelProps) {
  return (
    <section className="mt-5 rounded-3xl border border-red-100 bg-white p-7 text-center shadow-sm" role="alert">
      <p className="text-sm font-bold text-red-700">생성 오류</p>
      <h2 className="mt-2 text-xl font-extrabold text-slate-900">여행 계획을 완성하지 못했어요</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">입력한 여행 조건은 그대로 보관되어 있습니다. 조건을 확인한 뒤 다시 만들 수 있어요.</p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onRetry} className="rounded-xl bg-[#0077b6] px-4 py-3 text-sm font-bold text-white hover:bg-[#005d90]">다시 시도하기</button>
        <button type="button" onClick={onEditConditions} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200">조건 수정하기</button>
      </div>
    </section>
  );
}
