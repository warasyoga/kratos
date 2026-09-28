# ADR-002 · Data Lokal Tanpa Backend

- Status: Diterima
- Tanggal: 2026-09-28

## Konteks
Hanya satu pengguna. Sinyal di gym sering buruk. Pengguna sempat mempertimbangkan Spring Boot.

## Keputusan
Semua data disimpan di **IndexedDB (Dexie)** di HP. Tidak ada server, akun, atau login.
Akses data selalu melalui **interface repository** di domain.

## Alternatif yang dipertimbangkan
| Opsi | Alasan tidak dipilih sekarang |
|---|---|
| Spring Boot + PostgreSQL | Dua proyek, biaya hosting server Java, butuh internet, logika sinkronisasi offline rumit |
| Supabase/Firebase | Tidak dibutuhkan untuk satu pengguna; menambah ketergantungan dan urusan privasi foto |

## Konsekuensi
- ✅ Cepat, offline penuh, privat, tanpa biaya server.
- ⚠️ Data bisa hilang jika HP rusak/data browser dihapus → fitur backup wajib (fitur 13) dan pengingat backup.
- 🔁 **Jalur ke backend nanti:** buat `Api*Repository` (Spring Boot/Supabase) yang mengimplementasikan interface yang sama, ditambah modul sinkronisasi di infrastructure. Domain, application, dan UI tidak berubah.
