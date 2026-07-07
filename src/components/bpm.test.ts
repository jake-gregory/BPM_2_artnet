import { describe, expect, it } from 'vitest';
import { VOLUME_THRESHOLD } from '../config.js';
import { computeAverageVolume, detectBpm } from './bpm.js';

describe('computeAverageVolume', () => {
  it('averages absolute sample values', () => {
    const samples = new Float32Array([0.5, -0.5, 0.25, -0.25]);
    expect(computeAverageVolume(samples)).toBeCloseTo(0.375, 10);
  });

  it('is zero for silence', () => {
    expect(computeAverageVolume(new Float32Array(1000))).toBe(0);
  });
});

describe('detectBpm', () => {
  it('holds the previous BPM when the recording is too quiet', () => {
    const quiet = new Float32Array(44100).fill(0.01); //Well under VOLUME_THRESHOLD
    const result = detectBpm(quiet, 128);
    expect(result.bpm).toBe(128);
    expect(result.volume).toBeLessThan(VOLUME_THRESHOLD);
  });

  it('detects tempo from a loud, rhythmic signal', () => {
    const sampleRate = 44100;
    const bpm = 120;
    const beatIntervalSamples = Math.round((60 / bpm) * sampleRate);
    const durationSec = 6;
    const numFrames = sampleRate * durationSec;
    const toneHz = 220;

    const samples = new Float32Array(numFrames);
    for (let i = 0; i < numFrames; i++) {
      const phase = i % beatIntervalSamples;
      const gateOn = phase < beatIntervalSamples / 2;
      samples[i] = gateOn ? 0.6 * Math.sin((2 * Math.PI * toneHz * i) / sampleRate) : 0;
    }

    const result = detectBpm(samples, 130);

    expect(result.volume).toBeGreaterThan(VOLUME_THRESHOLD);
    expect(result.bpm).toBeCloseTo(120, 0);
  });
});
