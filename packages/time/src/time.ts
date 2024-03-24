import { MS, type TimeUnits } from './units.js';

/**
 * Immutable time class.
 */
export class Time {
  readonly #ms: number;

  /**
   * Constructs a new time instance.
   */
  constructor(...args: [value: number, unit: TimeUnits] | [value: Time | Date]) {
    this.#ms = args.length === 1
      ? args[0] instanceof Date
        ? args[0].getTime()
        : args[0].as(MS)
      : Math.trunc(args[0]) * args[1];
  }

  /**
   * Returns the time as an offset from the epoch in the specified units.
   */
  readonly as = (unit: TimeUnits): number => {
    return Math.trunc(this.#ms / unit);
  };

  /**
   * Add a time span to the current time.
   */
  readonly add = (...args: [value: number, unit: TimeUnits] | [value: Time]): Time => {
    const ms = new Time(...args)
      .as(MS);
    return new Time(this.#ms + ms, MS);
  };

  /**
   * Subtract a time span from the current time.
   */
  readonly subtract = (...args: [value: number, unit: TimeUnits] | [value: Time]): Time => {
    const ms = new Time(...args)
      .as(MS);
    return new Time(this.#ms - ms, MS);
  };

  /**
   * Returns the time as a `Date` instance.
   */
  readonly toDate = (): Date => {
    return new Date(this.#ms);
  };
}

/**
 * Get a new {@link Time} instance.
 */
export const time = Object.assign((...args: ConstructorParameters<typeof Time>): Time => new Time(...args), {
  /**
   * Get a {@link Time} instance representing the current time.
   */
  now: (): Time => time(Date.now(), MS),
});
