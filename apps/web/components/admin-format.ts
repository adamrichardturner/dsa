export const formatDay = (day: string): string => {
  const [year, month, date] = day.split("-");
  if (year === undefined || month === undefined || date === undefined) {
    return day;
  }
  const parsed = Date.UTC(Number(year), Number(month) - 1, Number(date));
  if (Number.isNaN(parsed)) {
    return day;
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(parsed));
};

export const formatTimestamp = (value: string | null): string => {
  if (value === null) {
    return "No activity";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;

export const formatAverage = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 1 });
