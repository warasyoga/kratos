# 11 · Glosarium

Istilah gym dan teknis yang dipakai di aplikasi dan dokumen. Teks ini juga menjadi sumber
penjelasan singkat (tooltip) di aplikasi.

## Istilah latihan

| Istilah | Arti |
|---|---|
| **Rep / repetisi** | Satu kali gerakan penuh (turun + naik) |
| **Set** | Sekumpulan repetisi tanpa istirahat, mis. 10 repetisi = 1 set |
| **Set kerja** | Set yang dihitung untuk progres (bukan pemanasan) |
| **Set pemanasan** | Set ringan sebelum set kerja untuk menyiapkan otot dan sendi |
| **3 × 8–12** | 3 set, masing-masing 8 sampai 12 repetisi |
| **RIR** | *Reps in Reserve*: sisa repetisi yang masih sanggup dilakukan sebelum gagal |
| **RPE** | *Rate of Perceived Exertion*: skala 1–10 rasa berat; RPE 8 ≈ RIR 2 |
| **1RM** | *One-Rep Max*: beban maksimal untuk satu repetisi |
| **e1RM** | 1RM estimasi, dihitung dari set biasa tanpa perlu uji beban maksimal |
| **PR** | *Personal Record*: rekor pribadi |
| **Volume** | Jumlah set kerja per otot per minggu |
| **Tonase** | Beban × repetisi dijumlahkan (kg) |
| **Progressive overload** | Menaikkan tuntutan latihan bertahap (beban/repetisi) agar tubuh terus beradaptasi |
| **Double progression** | Naikkan repetisi dulu sampai batas atas, baru naikkan beban |
| **Deload** | Minggu latihan ringan terencana untuk pemulihan |
| **Mesosiklus / blok** | Periode latihan beberapa minggu (di Kratos: 6 minggu) |
| **Split** | Cara membagi otot per hari: Full Body, Upper/Lower, Push/Pull/Legs |
| **Upper / Lower** | Hari tubuh atas / hari tubuh bawah |
| **Push / Pull / Legs** | Hari gerakan mendorong / menarik / kaki |
| **Compound** | Gerakan multi-sendi (squat, bench press) |
| **Isolasi** | Gerakan satu sendi (bicep curl, leg extension) |
| **Hipertrofi** | Pertumbuhan ukuran otot |
| **Autoregulasi** | Menyesuaikan latihan dengan kondisi tubuh hari itu |
| **Readiness** | Tingkat kesiapan latihan hasil check-in (hijau/kuning/merah) |

## Istilah nutrisi & tubuh

| Istilah | Arti |
|---|---|
| **BMR** | Energi yang dipakai tubuh saat istirahat total |
| **TDEE** | Total energi harian termasuk aktivitas |
| **Surplus kalori** | Makan lebih banyak dari TDEE agar tubuh bisa membangun otot |
| **Makro** | Protein, karbohidrat, lemak |
| **BMI** | Indeks massa tubuh (berat ÷ tinggi²) |
| **% lemak tubuh** | Persentase berat tubuh yang berupa lemak |
| **Tren berat** | Rata-rata berat yang dihaluskan agar fluktuasi harian tidak menyesatkan |

## Istilah teknis (untuk pengembang)

| Istilah | Arti |
|---|---|
| **PWA** | Web app yang bisa dipasang ke Home Screen dan jalan offline |
| **IndexedDB / Dexie** | Database di browser / library untuk mengaksesnya |
| **Service worker** | Skrip latar yang menyimpan file aplikasi untuk offline |
| **Domain** | Lapisan berisi aturan dan rumus murni |
| **Use case** | Satu aksi pengguna beserta langkah-langkahnya |
| **Repository** | Interface untuk menyimpan/mengambil data tanpa peduli database-nya |
| **Composition root** | Satu tempat yang merakit semua lapisan (`src/app/container.ts`) |
| **ADR** | Catatan alasan keputusan arsitektur |
