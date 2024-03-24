/**
 * Time units as multiples of milliseconds.
 */
export enum TimeUnits {
  MS = 1,
  SECONDS = 1000,
  MINUTES = 60 * SECONDS,
  HOURS = 60 * MINUTES,
  DAYS = 24 * HOURS,
  WEEKS = 7 * DAYS,
  MONTHS = 31 * DAYS,
  YEARS = 365 * DAYS,
}

/**
 * Millisecond in milliseconds (ie. 1).
 */
export const MS = TimeUnits.MS;
/**
 * Second in milliseconds.
 */
export const SECONDS = TimeUnits.SECONDS;
/**
 * Minute in milliseconds.
 */
export const MINUTES = TimeUnits.MINUTES;
/**
 * Hour in milliseconds.
 */
export const HOURS = TimeUnits.HOURS;
/**
 * Day in milliseconds.
 */
export const DAYS = TimeUnits.DAYS;
/**
 * Week in milliseconds.
 */
export const WEEKS = TimeUnits.WEEKS;
/**
 * Month (31 days) in milliseconds.
 */
export const MONTHS = TimeUnits.MONTHS;
/**
 * Year (365 days) in milliseconds.
 */
export const YEARS = TimeUnits.YEARS;
