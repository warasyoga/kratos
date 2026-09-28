/** Pembuat ID yang disuntikkan, agar domain tetap deterministik di test. */
export type IdGenerator = () => string;

/** ID berurutan: 'p-1', 'p-2', ... Dipakai di test. */
export function createSequentialIds(prefix = 'id'): IdGenerator {
  let n = 0;
  return () => `${prefix}-${++n}`;
}
