import { MS, type TimeUnit } from './unit.js';

class Time {
  readonly #ms: number;

  constructor(...args: [value: number, unit: TimeUnit] | [value: Time | Date]) {
    this.#ms = args.length === 1
      ? args[0] instanceof Date
        ? args[0].getTime()
        : args[0].as(MS)
      : Math.trunc(args[0]) * args[1];
  }

  readonly as = (unit: TimeUnit): number => {
    return Math.trunc(this.#ms / unit);
  };

  readonly add = (...args: [value: number, unit: TimeUnit] | [value: Time]): Time => {
    const ms = (args.length === 1 ? args[0] : new Time(...args)).as(MS);
    return new Time(this.#ms + ms, MS);
  };

  readonly subtract = (...args: [value: number, unit: TimeUnit] | [value: Time]): Time => {
    const ms = new Time(...args)
      .as(MS);
    return new Time(this.#ms - ms, MS);
  };

  readonly toDate = (): Date => {
    return new Date(this.#ms);
  };
}

export type { Time };

export const time = Object.assign((...args: ConstructorParameters<typeof Time>): Time => new Time(...args), {
  now: (): Time => time(Date.now(), MS),
});
