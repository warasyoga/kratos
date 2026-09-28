import { err, ok, type Result } from './result';

describe('Result', () => {
  it('ok membungkus nilai', () => {
    const result: Result<number> = ok(82.3);
    expect(result).toEqual({ ok: true, value: 82.3 });
  });

  it('err membungkus error', () => {
    const result: Result<number> = err({ code: 'invalid_reps', message: 'reps >= 1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid_reps');
  });
});
