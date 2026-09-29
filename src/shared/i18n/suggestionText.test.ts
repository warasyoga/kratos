import { ALL_RULES } from '@/domain/trainer/suggestions';
import { describeSuggestion, SUGGESTION_RULES } from './suggestionText';

describe('teks saran', () => {
  it.each(ALL_RULES.map((r) => r.id))('aturan %s punya kalimat dan dasar ilmiah', (id) => {
    expect(SUGGESTION_RULES[id]).toBeDefined();
    expect(SUGGESTION_RULES[id]?.why).not.toBe('');
  });

  it('kalibrasi kalori: arah naik/turun dari tanda deltaKcal', () => {
    const text = (deltaKcal: number) =>
      describeSuggestion(
        {
          ruleId: 'calorie_recalibration',
          targetKey: 'calories',
          category: 'nutrition',
          params: { deltaKcal },
        },
        (id) => id,
      ).message;
    expect(text(150)).toBe('Berat naik kurang dari 0,25%/minggu. Naikkan target kalori 150 kkal?');
    expect(text(-150)).toBe(
      'Berat naik lebih cepat dari 0,5%/minggu. Turunkan target kalori 150 kkal?',
    );
  });

  it('protein: angka rata-rata dan target', () => {
    const { message } = describeSuggestion(
      {
        ruleId: 'low_protein',
        targetKey: 'protein',
        category: 'nutrition',
        params: { averageG: 95, targetG: 137 },
      },
      (id) => id,
    );
    expect(message).toContain('Protein rata-rata 95 g, target 137 g.');
  });
});
