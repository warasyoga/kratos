import { act, renderHook } from '@testing-library/react';
import { captureInstallPrompt, useInstallPrompt } from './installPrompt';

function fakeInstallEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  };
  event.prompt = vi.fn(async () => {});
  event.userChoice = Promise.resolve({ outcome });
  return event;
}

describe('useInstallPrompt', () => {
  beforeAll(() => captureInstallPrompt());

  it('tidak bisa dipasang sebelum browser menawarkan (mis. iPhone)', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.installed).toBe(false);
  });

  it('tawaran browser → tombol aktif → dipasang', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = fakeInstallEvent('accepted');
    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    let accepted = false;
    await act(async () => {
      accepted = await result.current.install();
    });
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(accepted).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });
});
