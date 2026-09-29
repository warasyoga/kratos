import type { AsyncZippable, AsyncZippableFile } from 'fflate';

/**
 * Zip dengan fflate, dimuat hanya saat backup dipakai (tidak masuk JavaScript awal).
 * Foto JPEG sudah terkompres, jadi disimpan tanpa kompresi ulang (level 0).
 */
export async function packZip(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  const { zip } = await import('fflate');
  const entries: AsyncZippable = Object.fromEntries(
    Object.entries(files).map(([name, bytes]) => [
      name,
      [bytes, { level: name.endsWith('.jpg') ? 0 : 6 }] satisfies AsyncZippableFile,
    ]),
  );
  return new Promise((resolve, reject) =>
    zip(entries, (error, data) => (error ? reject(error) : resolve(data))),
  );
}

export async function unpackZip(bytes: Uint8Array): Promise<Record<string, Uint8Array>> {
  const { unzip } = await import('fflate');
  return new Promise((resolve, reject) =>
    unzip(bytes, (error, data) => (error ? reject(error) : resolve(data))),
  );
}
