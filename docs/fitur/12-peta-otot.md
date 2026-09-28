# 12 · Peta Otot

## Tujuan
Menunjukkan secara visual otot mana yang sudah dilatih minggu ini dan mana yang masih pulih.

## Tampilan
- Siluet tubuh depan & belakang (SVG, satu `path` per kelompok otot sesuai tipe `Muscle`)
- Mode **Pemulihan**: warna hijau (segar) / kuning (pulih sebagian) / oranye (baru dilatih)
- Mode **Volume minggu ini**: intensitas warna aksen sesuai set (0 → 20+), garis tepi hijau jika di zona 10–20
- Ketuk otot → sheet: set minggu ini, sesi terakhir, perkiraan pulih ("Siap lagi Kamis pagi")
- Versi kecil muncul di layar Hari Ini pada hari pemulihan

## Aturan
Lihat [05-keamanan-dan-pemulihan.md §3](../sains-latihan/05-keamanan-dan-pemulihan.md) dan
perhitungan set per otot di [03-desain-program.md](../sains-latihan/03-desain-program.md).
Status tidak hanya dibedakan warna: sheet dan label teks menyebut statusnya.

## Data
Query `getMuscleStatus(now)` → `Record<Muscle, { setsThisWeek, lastTrainedAt, recoveredAt, status }>`.

## Kriteria selesai
- [ ] Siluet tajam di semua ukuran layar, warna mengikuti token tema
- [ ] Status sama dengan hasil fungsi domain untuk data uji
