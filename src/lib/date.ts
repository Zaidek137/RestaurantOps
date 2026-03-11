export const getTodayLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

export const shiftDate = (date: string, offsetDays: number) => {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + offsetDays);
  const tzOffset = next.getTimezoneOffset();
  return new Date(next.getTime() - tzOffset * 60_000).toISOString().slice(0, 10);
};
