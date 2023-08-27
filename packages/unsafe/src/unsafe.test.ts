import { describe, expect, test, vi } from 'vitest';

import { unsafe } from './unsafe.js';

class MyError extends Error {
  name = 'MyError';

  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
  }
}

describe('unsafe', () => {
  test('unhandled with no handlers', async () => {
    const promise = unsafe(async () => {
      throw new Error('test');
    }).call();

    await expect(promise).rejects.toThrowError('test');
  });

  test('handled type only', async () => {
    const error = new MyError('test');
    const fn = vi.fn().mockResolvedValue(true);
    const promise = unsafe(async () => {
      throw error;
    })
      .handle(MyError, fn)
      .handle(MyError, async () => false)
      .call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenLastCalledWith(
      error,
      expect.objectContaining({
        retry: 0,
        errors: [],
      }),
    );
  });

  test('unhandled type only', async () => {
    const promise = unsafe(async () => {
      throw new Error('test');
    })
      .handle(MyError, async () => {})
      .call();

    await expect(promise).rejects.toThrowError('test');
  });

  test('handled deep match only', async () => {
    const promise = unsafe(async () => {
      throw new MyError('test', { cause: { foo: 'bar' } });
    })
      .handle({ name: 'MyError', message: 'test', cause: { foo: 'bar' } }, async () => true)
      .call();

    await expect(promise).resolves.toBe(true);
  });

  test('unhandled deep match only', async () => {
    const promise = unsafe(async () => {
      throw new MyError('test', { cause: { foo: 'bar' } });
    })
      .handle({ name: 'MyError', message: 'test', cause: { foo: 'baz' } }, async () => true)
      .call();

    await expect(promise).rejects.toThrowError('test');
  });

  test('handled type and deep match', async () => {
    const promise = unsafe(async () => {
      throw new MyError('test', { cause: { foo: 'a', bar: ['b', 'c'] } });
    })
      .handle(MyError, { cause: { foo: 'a', bar: ['b', 'c'] } }, async () => true)
      .call();

    await expect(promise).resolves.toBe(true);
  });

  test('unhandled type and deep match', async () => {
    const promise = unsafe(async () => {
      throw new Error('test', { cause: { foo: 'a', bar: ['b', 'c'] } });
    })
      // Wrong type.
      .handle(MyError, { cause: { foo: 'a', bar: ['b', 'c'] } }, async () => true)
      // Wrong props.
      .handle(Error, { cause: { foo: 'a', bar: ['b', 'c', 'd'] } }, async () => true)
      .call();

    await expect(promise).rejects.toThrowError('test');
  });

  test('undefined handler callback', async () => {
    const promise = unsafe(async () => {
      throw new Error('test');
    })
      .handle(Error)
      .call();

    await expect(promise).resolves.toBeUndefined();
  });

  test('first handler matched', async () => {
    const promise = unsafe(async () => {
      throw new Error('test');
    })
      .handle(Error, async () => true)
      .handle(Error, async () => false)
      .call();

    await expect(promise).resolves.toBe(true);
  });

  test('handler errors are unhandled', async () => {
    const promise = unsafe(async () => {
      throw new Error('test');
    })
      .handle(Error, async () => {
        throw new Error('handler');
      })
      .handle(Error, async () => true)
      .call();

    await expect(promise).rejects.toThrowError('handler');
  });

  test('cleanups are called', async () => {
    let result = '';
    const promise = unsafe(async () => {
      throw new Error('test');
    })
      .handle(Error, async () => (result += 'a'))
      .cleanup(async () => void (result += 'b'))
      .cleanup(async () => void (result += 'c'))
      .cleanup(async () => void (result += 'd'))
      .call();

    await expect(promise).resolves.toBe('a');
    expect(result).toBe('abcd');
  });

  test('cleanup errors are unhandled', async () => {
    const promise = unsafe(async () => {})
      .cleanup(async () => {
        throw new Error('cleanup');
      })
      .call();

    await expect(promise).rejects.toThrowError('cleanup');
  });

  test('retry type only', async () => {
    const fn = vi.fn<[], boolean>().mockRejectedValueOnce(new Error('test')).mockResolvedValueOnce(true);
    const promise = unsafe(fn).retry(Error).call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('retry deep match only', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('1')).mockResolvedValueOnce(true);
    const cleanup = vi.fn().mockResolvedValue(undefined);
    const promise = unsafe(fn).retry({ message: '1' }).cleanup(cleanup).call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  test('retry type and deep match', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new MyError('1')).mockResolvedValueOnce(true);
    const cleanup = vi.fn().mockResolvedValue(undefined);
    const promise = unsafe(fn).retry(MyError, { message: '1' }).cleanup(cleanup).call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  test('retry 2 times', async () => {
    const fn = vi
      .fn<[], boolean>()
      .mockRejectedValueOnce(new MyError('1'))
      .mockRejectedValueOnce(new MyError('2'))
      .mockResolvedValueOnce(true);
    const promise = unsafe(fn).retry(MyError).maxRetries(2).call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('retry with cleanup', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('1')).mockResolvedValueOnce(true);
    const cleanup1 = vi.fn().mockResolvedValue(undefined);
    const cleanup2 = vi.fn().mockResolvedValue(undefined);
    const promise = unsafe(fn).retry(Error).cleanup(cleanup1).cleanup(cleanup2).call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(cleanup1).toHaveBeenCalledOnce();
    expect(cleanup2).toHaveBeenCalledOnce();
  });

  test('retry, then handle, and cleanup', async () => {
    const error1 = new Error('1');
    const error2 = new Error('2');
    const fn = vi.fn().mockRejectedValueOnce(error1).mockRejectedValueOnce(error2);
    const handle = vi.fn().mockResolvedValue(true);
    const cleanup = vi.fn().mockResolvedValue(undefined);
    const promise = unsafe(fn).retry(Error).handle(Error, handle).cleanup(cleanup).call();

    await expect(promise).resolves.toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(handle).toHaveBeenCalledOnce();
    expect(handle).toHaveBeenLastCalledWith(error2, expect.objectContaining({ retry: 1, errors: [error1] }));
    expect(cleanup).toHaveBeenCalledOnce();
  });

  test('transform non-errors to errors', async () => {
    const promise = unsafe(async () => {
      throw 'foo';
    }).call();

    await expect(promise).rejects.toBeInstanceOf(TypeError);
    await expect(promise).rejects.toMatchObject({ message: 'Invalid Error', cause: 'foo' });
  });
});
