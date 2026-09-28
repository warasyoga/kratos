import { render, screen } from '@testing-library/react';
import { Meter } from './Meter';

describe('Meter', () => {
  it('menampilkan persentase untuk pembaca layar', () => {
    render(<Meter label="Protein" valueText="96 / 137 g" ratio={96 / 137} />);
    const bar = screen.getByRole('progressbar', { name: 'Protein' });
    expect(bar).toHaveAttribute('aria-valuenow', '70');
    expect(bar).toHaveAttribute('aria-valuetext', '96 / 137 g');
  });

  it('memotong rasio di luar 0–1', () => {
    render(<Meter label="Kalori" valueText="3.100 / 2.880 kkal" ratio={1.08} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
