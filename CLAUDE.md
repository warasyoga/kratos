# CLAUDE.md

Panduan untuk asisten AI yang bekerja di repo ini.

- Proyek: PWA trainer & pemantau gym pribadi (satu pengguna, offline, data di IndexedDB).
- Semua rancangan ada di `docs/`. Baca `docs/README.md` sebelum mengubah kode.
- Komunikasi dengan pemilik proyek dalam bahasa Indonesia. Nama kode dalam bahasa Inggris.

## Aturan wajib

1. Ikuti aturan lapisan di `docs/03-arsitektur.md`. Jangan mengimpor Dexie/React di `src/domain`.
2. Semua angka ilmiah berada di `src/domain/standards.ts` dengan sumber; rumus mengikuti `docs/sains-latihan/`.
3. Setiap contoh hitung di `docs/sains-latihan/` dan tabel uji di `docs/mesin-trainer/` harus menjadi unit test.
4. Perubahan perilaku = perbarui dokumen terkait di commit yang sama.
5. Teks yang tampil ke pengguna ada di `src/shared/i18n/id.ts`.
6. Warna hanya lewat token di `src/shared/styles/tokens.css`.
7. Satuan beban hanya kg.

## Perintah

```bash
npm run dev | test | lint | typecheck | build | e2e
```
