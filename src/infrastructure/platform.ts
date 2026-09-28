/**
 * Minta browser tidak menghapus data aplikasi saat penyimpanan penuh.
 * docs/05-model-data.md "Keamanan data"
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
