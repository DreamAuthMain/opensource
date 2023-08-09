enum TimeUnit {
  MS = 1,
  SECONDS = 1000,
  MINUTES = 60 * SECONDS,
  HOURS = 60 * MINUTES,
  DAYS = 24 * HOURS,
  WEEKS = 7 * DAYS,
  MONTHS = 31 * DAYS,
  YEARS = 365 * DAYS,
}

export type { TimeUnit };
export const MS = TimeUnit.MS;
export const SECONDS = TimeUnit.SECONDS;
export const MINUTES = TimeUnit.MINUTES;
export const HOURS = TimeUnit.HOURS;
export const DAYS = TimeUnit.DAYS;
export const WEEKS = TimeUnit.WEEKS;
export const MONTHS = TimeUnit.MONTHS;
export const YEARS = TimeUnit.YEARS;
