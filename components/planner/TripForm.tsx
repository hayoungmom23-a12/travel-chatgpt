"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { formatKrw, getPerPersonBudget } from "@/lib/plan/budget";
import { getTripDuration } from "@/lib/plan/dates";
import { defaultTripInput, relationshipValues, tripInputSchema, type TripInput } from "@/lib/schemas/plan";

type TripFormProps = { initialValues?: TripInput; isSubmitting?: boolean; onSubmit: (values: TripInput) => void };

const quickDestinations = ["제주", "강릉·속초", "후쿠오카", "타이베이"];
const styleOptions = [
  { value: "nature_healing", label: "🌊 자연 & 힐링" },
  { value: "cafe_gourmet", label: "☕ 감성 카페 & 미식" },
  { value: "activity", label: "🏃 알찬 액티비티" },
  { value: "culture_history", label: "🏛️ 문화·역사 탐방" }
] as const;

export function TripForm({ initialValues = defaultTripInput, isSubmitting = false, onSubmit }: TripFormProps) {
  const [avoidanceDraft, setAvoidanceDraft] = useState("");
  const { register, handleSubmit, watch, setValue, setFocus, formState: { errors } } = useForm<TripInput>({ resolver: zodResolver(tripInputSchema), defaultValues: initialValues, mode: "onSubmit" });
  const countRegistration = register("travelerCount");
  const destination = watch("destination");
  const departureDate = watch("departureDate");
  const arrivalDate = watch("arrivalDate");
  const travelerCount = watch("travelerCount");
  const relationship = watch("relationship");
  const totalBudgetKrw = watch("totalBudgetKrw") || 0;
  const styles = watch("styles") || [];
  const avoidances = watch("avoidances") || [];
  const duration = getTripDuration(departureDate, arrivalDate);
  const perPerson = getPerPersonBudget(totalBudgetKrw, travelerCount);

  function submitInvalid(formErrors: FieldErrors<TripInput>) {
    const first = Object.keys(formErrors)[0] as keyof TripInput | undefined;
    if (first) setFocus(first);
  }

  function toggleStyle(value: TripInput["styles"][number]) {
    setValue("styles", styles.includes(value) ? styles.filter((item) => item !== value) : [...styles, value], { shouldDirty: true });
  }

  function addAvoidance() {
    const value = avoidanceDraft.trim();
    if (!value || avoidances.includes(value)) return;
    setValue("avoidances", [...avoidances, value], { shouldDirty: true });
    setAvoidanceDraft("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, submitInvalid)} className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
      <label className="mb-2 block text-sm font-bold text-slate-800" htmlFor="destination"><span className="mr-1 text-[#0077b6]">⌖</span> 어디로 떠나시나요? <span className="text-orange-500">*</span></label>
      <div className="relative"><input id="destination" {...register("destination")} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-10 font-semibold text-slate-900" placeholder="예: 제주도 서귀포 및 동부" aria-invalid={Boolean(errors.destination)} />{destination && <button type="button" onClick={() => setValue("destination", "", { shouldDirty: true })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="여행지 지우기">✕</button>}</div>
      {errors.destination && <p className="mt-2 text-xs font-semibold text-red-600">{errors.destination.message}</p>}
      <div className="mt-3 flex flex-wrap gap-2" aria-label="추천 여행지">{quickDestinations.map((place) => <button key={place} type="button" onClick={() => setValue("destination", place, { shouldDirty: true })} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0077b6]">{place}</button>)}</div>

      <fieldset className="mt-6 border-t border-slate-100 pt-5"><legend className="mb-2 text-sm font-bold text-slate-800">▣ 일정 <span className="text-orange-500">*</span></legend><div className="grid gap-3 sm:grid-cols-2"><label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-500">출발일<input type="date" {...register("departureDate")} className="mt-1 block w-full bg-transparent text-sm font-bold text-slate-900" aria-invalid={Boolean(errors.departureDate)} /></label><label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-500">도착일<input type="date" {...register("arrivalDate")} className="mt-1 block w-full bg-transparent text-sm font-bold text-slate-900" aria-invalid={Boolean(errors.arrivalDate)} /></label></div>{(errors.departureDate || errors.arrivalDate) && <p className="mt-2 text-xs font-semibold text-red-600">{errors.departureDate?.message ?? errors.arrivalDate?.message}</p>}{duration && <p className="mt-2 text-xs font-semibold text-[#0077b6]">{duration.nights}박 {duration.days}일</p>}</fieldset>

      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-800">◉ 인원 <span className="text-orange-500">*</span><select {...countRegistration} value={travelerCount} onChange={(event) => { const nextCount = event.target.value as TripInput["travelerCount"]; setValue("travelerCount", nextCount, { shouldValidate: true, shouldDirty: true }); setValue("relationship", nextCount === "1" ? "solo" : relationship === "solo" ? "couple" : relationship, { shouldValidate: true }); }} className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900"><option value="1">1명 (나홀로 여행)</option><option value="2">2명 (소규모)</option><option value="3-4">3~4명</option><option value="5+">5인 이상 단체</option></select></label><label className="text-sm font-bold text-slate-800">♥ 동행자 관계 <span className="text-orange-500">*</span><select {...register("relationship")} value={relationship} onChange={(event) => setValue("relationship", event.target.value as TripInput["relationship"], { shouldValidate: true, shouldDirty: true })} className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900">{travelerCount === "1" ? <option value="solo">혼자만의 여행</option> : relationshipValues.filter((value) => value !== "solo").map((value) => <option key={value} value={value}>{({ couple: "연인/커플", friends: "친구", parents: "부모님과 효도여행", family_with_children: "어린 자녀 동반 가족" } as Record<string, string>)[value]}</option>)}</select></label></div>
      {(errors.travelerCount || errors.relationship) && <p className="mt-2 text-xs font-semibold text-red-600">{errors.travelerCount?.message ?? errors.relationship?.message}</p>}

      <label className="mt-6 block border-t border-slate-100 pt-5 text-sm font-bold text-slate-800">₩ 총 예산 (총액) <span className="text-orange-500">*</span><input type="number" min="1" {...register("totalBudgetKrw", { valueAsNumber: true })} className="mt-2 block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900" aria-invalid={Boolean(errors.totalBudgetKrw)} />{errors.totalBudgetKrw ? <p className="mt-2 text-xs font-semibold text-red-600">{errors.totalBudgetKrw.message}</p> : <span className="mt-2 block text-xs font-medium text-[#0077b6]">1인 참고 {perPerson.minKrw === perPerson.maxKrw ? formatKrw(perPerson.minKrw) : `${formatKrw(perPerson.minKrw)} ~ ${formatKrw(perPerson.maxKrw)}`}</span>}</label>

      <fieldset className="mt-6 border-t border-slate-100 pt-5"><legend className="mb-3 text-sm font-bold text-slate-800">✦ 여행 스타일 <span className="text-xs font-medium text-slate-500">(다중 선택)</span></legend><div className="grid gap-2 sm:grid-cols-2">{styleOptions.map((style) => <label key={style.value} className={`flex cursor-pointer items-center rounded-xl border px-3 py-3 text-sm font-semibold ${styles.includes(style.value) ? "border-[#0077b6] bg-sky-50 text-[#005d90]" : "border-slate-200 bg-slate-50 text-slate-700"}`}><input type="checkbox" checked={styles.includes(style.value)} onChange={() => toggleStyle(style.value)} className="mr-2 h-4 w-4 accent-[#0077b6]" />{style.label}</label>)}</div></fieldset>

      <fieldset className="mt-6 border-t border-slate-100 pt-5"><legend className="mb-3 text-sm font-bold text-slate-800">⊘ 피하고 싶은 것 <span className="text-xs font-medium text-slate-500">(선택)</span></legend><div className="mb-3 flex flex-wrap gap-2">{avoidances.map((avoidance) => <span key={avoidance} className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-900">{avoidance}<button type="button" onClick={() => setValue("avoidances", avoidances.filter((item) => item !== avoidance), { shouldDirty: true })} aria-label={`${avoidance} 삭제`} className="text-orange-500">✕</button></span>)}</div><div className="flex gap-2"><input value={avoidanceDraft} onChange={(event) => setAvoidanceDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addAvoidance(); } }} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm" placeholder="예: 가파른 계단, 시끄러운 클럽" aria-label="피하고 싶은 것 입력" /><button type="button" onClick={addAvoidance} className="rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-800">추가</button></div></fieldset>

      <button disabled={isSubmitting} type="submit" className="mt-7 flex w-full items-center justify-center rounded-2xl bg-[#0077b6] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-sky-600/25 transition hover:bg-[#005d90] disabled:cursor-not-allowed disabled:bg-slate-400">여행 계획 만들기 <span className="ml-2 text-amber-200">✦</span></button>
    </form>
  );
}
