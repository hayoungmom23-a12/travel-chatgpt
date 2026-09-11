import { generatedPlanSchema, type GeneratedPlan } from "@/lib/schemas/plan";

const STORAGE_KEY = "yeojeong.saved-plans.v1";
export type SavedPlan = { id: string; savedAt: string; plan: GeneratedPlan };

export function loadSavedPlans(): SavedPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const values = JSON.parse(raw) as unknown[];
    return values.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const candidate = value as { id?: unknown; savedAt?: unknown; plan?: unknown };
      const parsedPlan = generatedPlanSchema.safeParse(candidate.plan);
      return typeof candidate.id === "string" && typeof candidate.savedAt === "string" && parsedPlan.success ? [{ id: candidate.id, savedAt: candidate.savedAt, plan: parsedPlan.data }] : [];
    });
  } catch {
    return [];
  }
}

export function savePlan(plan: GeneratedPlan) {
  if (typeof window === "undefined") throw new Error("브라우저 저장소를 사용할 수 없습니다.");
  const record: SavedPlan = { id: crypto.randomUUID(), savedAt: new Date().toISOString(), plan };
  const next = [record, ...loadSavedPlans()].slice(0, 10);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}
