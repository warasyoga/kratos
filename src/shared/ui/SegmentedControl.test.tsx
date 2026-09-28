import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'a', label: 'Satu' },
  { value: 'b', label: 'Dua' },
] as const;

describe('SegmentedControl', () => {
  it('menandai pilihan aktif dan melaporkan perubahan', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Pilihan" options={options} value="a" onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Satu' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Dua' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Dua' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
