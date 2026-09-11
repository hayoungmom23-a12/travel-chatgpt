export function getTravelerRange(travelerCount: "1" | "2" | "3-4" | "5+") {
  if (travelerCount === "1") return { min: 1, max: 1 };
  if (travelerCount === "2") return { min: 2, max: 2 };
  if (travelerCount === "3-4") return { min: 3, max: 4 };
  return { min: 5, max: 5 };
}

export function getPerPersonBudget(totalBudgetKrw: number, travelerCount: "1" | "2" | "3-4" | "5+") {
  const { min, max } = getTravelerRange(travelerCount);
  return { minKrw: Math.floor(totalBudgetKrw / max), maxKrw: Math.floor(totalBudgetKrw / min) };
}

export function formatKrw(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(Math.max(0, Math.floor(value)))}원`;
}

export function recalculateBudget<T extends { amountKrw: number }>(totalBudgetKrw: number, travelerCount: "1" | "2" | "3-4" | "5+", categories: T[]) {
  const allocatedTotalKrw = categories.reduce((sum, category) => sum + category.amountKrw, 0);
  const perPerson = getPerPersonBudget(allocatedTotalKrw, travelerCount);
  return { allocatedTotalKrw, remainingKrw: totalBudgetKrw - allocatedTotalKrw, perPerson };
}
