import { describe, expect, test, vi } from 'vitest';

import { unsafe } from './unsafe.js';

class MyError extends Error {
  name = 'MyError';

  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}

describe('unsafe', () => {
  test('unhandled', () => {
    expect(() => {
      return unsafe(() => {
        throw new Error('test');
      }).call();
    }).toThrowError('test');
  });

  test('handle by type', () => {
    const a = unsafe(() => {
      throw new MyError('test');
    })
      .handle(MyError, () => 1)
      .handle(Error, () => 2)
      .call();

    expect(a).toBe(1);

    const b = unsafe(() => {
      throw new Error('test');
    })
      .handle(MyError, () => 1)
      .handle(Error, () => 2)
      .call();

    expect(b).toBe(2);
  });

  test('handle by deep match', () => {
    const a = unsafe(() => {
      throw new MyError('test', { cause: { foo: 'bar' } });
    })
      .handle({ name: 'MyError', message: 'test', cause: { foo: 'bar' } }, () => true)
      .call();

    expect(a).toBe(true);

    const b = unsafe(() => {
      throw new MyError('test', { cause: { foo: 'bar' } });
    })
      .handle({}, () => true)
      .call();

    expect(b).toBe(true);

    expect(() => {
      return unsafe(() => {
        throw new Error('test');
      })
        .handle({ message: 'not test' }, () => true)
        .call();
    }).toThrowError('test');
  });

  test('handle by type and deep match', () => {
    const a = unsafe(() => {
      throw new MyError('test', { cause: { foo: 'a', bar: ['b', 'c'] } });
    })
      .handle({ $type: MyError, cause: { foo: 'a', bar: ['b', 'c'] } }, () => true)
      .call();

    expect(a).toBe(true);

    expect(() => {
      return unsafe(() => {
        throw new Error('test');
      })
        .handle({ $type: MyError, message: 'test' }, () => true)
        .call();
    }).toThrowError('test');

    expect(() => {
      return unsafe(() => {
        throw new Error('test');
      })
        .handle({ $type: Error, message: 'not test' }, () => true)
        .call();
    }).toThrowError('test');
  });

  test('handler throws', () => {
    expect(() => {
      return unsafe(() => {
        throw new Error('test');
      })
        .handle(Error, () => {
          throw new Error('handler');
        })
        .handle(Error, () => true)
        .call();
    }).toThrowError('handler');
  });

  test('handle async', async () => {
    const a = unsafe(async () => {}).call();
    expect(a).toBeInstanceOf(Promise);

    const b = unsafe((): void => {
      throw new Error('test');
    })
      .handle(Error, async () => true)
      .call();

    expect(b).toBeInstanceOf(Promise);
    await expect(b).resolves.toBe(true);

    const c = unsafe(() => true)
      .handle(Error, async () => false)
      .call();

    expect(c).toBe(true);
  });

  test('cleanup', () => {
    const cleanup = vi.fn<[], void>();
    const a = unsafe((): void => {
      throw new Error('test');
    })
      .handle(Error, () => true)
      .cleanup(cleanup)
      .call();

    expect(a).toBe(true);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  test('cleanup with error', () => {
    expect(() => {
      return unsafe(() => {
        throw new Error('test');
      })
        .handle(Error, () => true)
        .cleanup(() => {
          throw new Error('cleanup');
        })
        .call();
    }).toThrowError('cleanup');
  });

  test('cleanup async', async () => {
    let cleanup = '';
    const a = unsafe(() => true)
      .cleanup(async () => {
        cleanup += 'a';
      })
      .cleanup(() => {
        cleanup += 'b';
      })
      .cleanup(async () => {
        cleanup += 'c';
      })
      .call();

    void Promise.resolve();

    expect(a).toBeInstanceOf(Promise);
    await expect(a).resolves.toBe(true);
    expect(cleanup).toBe('abc');
  });

  test('cleanup retry with unhandled error', async () => {
    const fn = vi.fn().mockImplementation(() => {
      throw new Error('test');
    });
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn().mockResolvedValue(undefined);

    const a = unsafe(fn).retry(Error).cleanup(cleanup1).cleanup(cleanup2).call();
    expect(a).toBeInstanceOf(Promise);
    await expect(a).rejects.toBeInstanceOf(Error);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup1).toHaveBeenCalledOnce();
    expect(cleanup2).toHaveBeenCalledOnce();
  });

  test('cleanup after async with unhandled error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('test'));
    const cleanup = vi.fn();
    const a = unsafe(fn).retry(Error).cleanup(cleanup).call();

    await expect(a).rejects.toBeInstanceOf(Error);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  test('allow', () => {
    const a = unsafe(() => {
      throw new MyError('test');
    })
      .allow(MyError, true)
      .allow(Error)
      .call();

    expect(a).toBe(true);

    const b = unsafe(() => {
      throw new Error('test');
    })
      .allow(MyError, 1)
      .allow(Error)
      .call();

    expect(b).toBe(undefined);
  });

  test('retry', () => {
    const fn = vi
      .fn<[], boolean>()
      .mockImplementationOnce(() => {
        throw new Error('test');
      })
      .mockReturnValueOnce(true);
    const a = unsafe(fn).retry(Error).call();

    expect(a).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('retry 2 times', () => {
    const fn = vi
      .fn<[], boolean>()
      .mockImplementationOnce(() => {
        throw new MyError('1');
      })
      .mockImplementationOnce(() => {
        throw new MyError('2');
      })
      .mockReturnValueOnce(true);
    const a = unsafe(fn).retry(MyError).maxRetries(2).call();

    expect(a).toBe(true);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('retry async', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('1')).mockResolvedValue(true);
    const a = unsafe(fn).retry(Error).call();
    expect(a).toBeInstanceOf(Promise);
    await expect(a).resolves.toBe(true);
  });

  test('retry with cleanup', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('1')).mockResolvedValueOnce(true);
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();
    const a = unsafe(fn).retry(Error).cleanup(cleanup1).cleanup(cleanup2).call();
    await expect(a).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup1).toHaveBeenCalledOnce();
    expect(cleanup2).toHaveBeenCalledOnce();
  });

  test('invalid error', () => {
    const a = unsafe((): void => {
      throw 'foo';
    })
      .handle(Error, (error) => error)
      .call();
    expect(a).toBeInstanceOf(TypeError);
    expect(a).toMatchObject({ message: 'Invalid Error', cause: 'foo' });
  });
});
