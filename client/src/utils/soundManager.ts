// Sound manager to handle audio effects for game actions
const sounds: Record<string, HTMLAudioElement | null> = {
  move: null,
  capture: null,
  check: null,
  checkmate_won: null,
  checkmate_lose: null,
  stalemate: null,
  timeout: null,
  agreed_draw: null,
};

// Initialize audio elements lazily to avoid loading issues
function initSound(name: string): HTMLAudioElement {
  const path = `/sounds/${name}.mp3`;
  return new Audio(path);
}

export function playSound(type: 'move' | 'capture' | 'check' | 'checkmate_won' | 'checkmate_lose' | 'stalemate' | 'timeout' | 'agreed_draw'): void {
  const isEnabled = localStorage.getItem('soundEnabled') !== 'false';
  if (!isEnabled) return;

  try {
    if (!sounds[type]) {
      sounds[type] = initSound(type);
    }
    const audio = sounds[type];
    if (audio) {
      // Reset position to play overlapping sound instances rapidly
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Safe catch: browsers restrict audio autoplay prior to user interaction
      });
    }
  } catch (error) {
    console.warn(`[SoundManager] Failed to play sound "${type}":`, error);
  }
}
