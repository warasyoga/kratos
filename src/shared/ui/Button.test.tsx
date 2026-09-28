import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('default bertipe button agar tidak mengirim form tanpa sengaja', () => {
    render(<Button>Mulai latihan</Button>);
    expect(screen.getByRole('button', { name: 'Mulai latihan' })).toHaveAttribute('type', 'button');
  });

  it('memanggil onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Simpan set</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan set' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('tidak bisa ditekan saat disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Simpan
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
