import { backupFileName, photoPath, toCsv } from './backup';

const BOM = String.fromCharCode(0xfeff);

describe('backup', () => {
  it('nama file dan path foto', () => {
    expect(backupFileName('2026-09-28')).toBe('kratos-backup-2026-09-28.zip');
    expect(photoPath('p1', 'full')).toBe('photos/p1.jpg');
    expect(photoPath('p1', 'thumb')).toBe('photos/p1-thumb.jpg');
  });

  it('CSV: BOM, titik koma, kutip untuk isi khusus, CRLF', () => {
    const csv = toCsv([
      ['Tanggal', 'Gerakan', 'Beban (kg)'],
      ['2026-09-28', 'Push; "dada"', '52,5'],
    ]);
    expect(csv).toBe(`${BOM}Tanggal;Gerakan;Beban (kg)\r\n2026-09-28;"Push; ""dada""";52,5\r\n`);
  });
});
