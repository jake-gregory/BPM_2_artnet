import { describe, expect, it, vi } from 'vitest';

vi.mock('music-tempo', () => ({
  default: vi.fn(function () {
    throw new Error('Tempo extraction failed');
  }),
}));

import { VOLUME_THRESHOLD } from '../config.js';
import { detectBpm } from './bpm.js';

describe('detectBpm', () => {
  it('falls back to the previous BPM if tempo extraction throws, instead of propagating', () => {
    const loud = new Float32Array(44100).fill(0.5); //Well above VOLUME_THRESHOLD

    const result = detectBpm(loud, 128);

    expect(result.volume).toBeGreaterThan(VOLUME_THRESHOLD);
    expect(result.bpm).toBe(128);
  });
});
