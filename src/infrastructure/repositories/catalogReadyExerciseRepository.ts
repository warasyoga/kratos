import type { Exercise, ExerciseGuide } from '@/domain/exercise/types';
import type { ExerciseRepository } from '@/domain/repositories';

/**
 * Perpustakaan gerakan yang menunggu katalog bawaan selesai dipasang.
 * Dengan ini UI bisa tampil segera; hanya query gerakan yang menunggu pemasangan katalog
 * (kunjungan pertama / setelah pembaruan katalog). docs/06-design-system.md "Anggaran kinerja"
 */
export class CatalogReadyExerciseRepository implements ExerciseRepository {
  constructor(
    private readonly inner: ExerciseRepository,
    private readonly ready: Promise<void>,
  ) {}

  async list(): Promise<Exercise[]> {
    await this.ready;
    return this.inner.list();
  }

  async get(id: string): Promise<Exercise | null> {
    await this.ready;
    return this.inner.get(id);
  }

  async getGuide(id: string): Promise<ExerciseGuide | null> {
    await this.ready;
    return this.inner.getGuide(id);
  }

  async saveCustom(exercise: Exercise, note?: string): Promise<void> {
    await this.ready;
    return this.inner.saveCustom(exercise, note);
  }

  async removeCustom(id: string): Promise<void> {
    await this.ready;
    return this.inner.removeCustom(id);
  }
}
