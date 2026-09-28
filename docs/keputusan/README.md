# Catatan Keputusan (ADR)

Architecture Decision Record mencatat **mengapa** sebuah keputusan diambil, supaya tidak
diperdebatkan ulang tanpa alasan baru. Keputusan yang diganti tidak dihapus; statusnya diubah
menjadi "Digantikan oleh ADR-xxx".

| ADR | Keputusan | Status |
|---|---|---|
| [ADR-001](ADR-001-pwa.md) | PWA dengan React + TypeScript, bukan aplikasi native | Diterima |
| [ADR-002](ADR-002-local-first.md) | Data lokal (IndexedDB), tanpa backend | Diterima |
| [ADR-003](ADR-003-arsitektur-berlapis.md) | Arsitektur berlapis dengan aturan yang ditegakkan lint | Diterima |
| [ADR-004](ADR-004-standar-ilmiah.md) | Semua perhitungan berbasis sumber ilmiah yang tercatat | Diterima |
| [ADR-005](ADR-005-pengingat.md) | Pengingat utama lewat kalender HP (.ics) | Diterima |

## Templat

```md
# ADR-00X · Judul
- Status: Diusulkan | Diterima | Digantikan oleh ADR-xxx
- Tanggal: YYYY-MM-DD

## Konteks
## Keputusan
## Alternatif yang dipertimbangkan
## Konsekuensi
```
