/**
 * Notifikasi lokal saat aplikasi aktif / baru dipakai (docs/fitur/10-pengingat.md).
 * Tanpa server, notifikasi tidak dijamin muncul saat aplikasi tertutup (ADR-005).
 * iPhone: hanya tersedia jika Kratos sudah dipasang ke layar utama.
 */
export type NotifyPermission = 'granted' | 'denied' | 'default' | 'unsupported';

const supported = () => typeof window !== 'undefined' && 'Notification' in window;

export function notificationPermission(): NotifyPermission {
  return supported() ? Notification.permission : 'unsupported';
}

/** Minta izin; dipanggil hanya saat pengguna menyalakan toggle. Penolakan tidak melempar error. */
export async function requestNotificationPermission(): Promise<NotifyPermission> {
  if (!supported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return notificationPermission();
  }
}

/**
 * Tampilkan notifikasi. Android Chrome mewajibkan service worker (`new Notification` ditolak),
 * jadi registrasi SW dipakai lebih dulu. Mengembalikan false jika gagal/tanpa izin.
 */
export async function showNotification(title: string, body: string, tag: string): Promise<boolean> {
  if (notificationPermission() !== 'granted') return false;
  const options: NotificationOptions = { body, tag, icon: '/icons/icon-192.png' };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
      return true;
    }
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/** Simpan teks sebagai file unduhan (mis. .ics: HP menawarkan "Tambahkan ke kalender"). */
export function downloadTextFile(fileName: string, mimeType: string, content: string): void {
  downloadBlob(fileName, new Blob([content], { type: mimeType }));
}

/** Simpan data biner (mis. backup .zip) sebagai file unduhan. */
export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
