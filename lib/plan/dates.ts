export function getTripDuration(departureDate: string, arrivalDate: string) {
  if (!departureDate || !arrivalDate || arrivalDate < departureDate) return null;

  const departure = new Date(`${departureDate}T00:00:00`);
  const arrival = new Date(`${arrivalDate}T00:00:00`);
  const days = Math.round((arrival.getTime() - departure.getTime()) / 86_400_000) + 1;

  if (!Number.isFinite(days) || days < 1) return null;
  return { days, nights: days - 1 };
}
