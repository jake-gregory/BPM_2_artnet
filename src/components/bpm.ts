import MusicTempo from 'music-tempo';
import { VOLUME_THRESHOLD } from '../config.js';

export interface BpmResult {
  bpm: number;
  volume: number;
}

export function computeAverageVolume(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += Math.abs(samples[i]);
  }
  return sum / samples.length;
}

export function detectTempo(samples: Float32Array): number {
  const musicTempo = new MusicTempo(samples);
  return Number(musicTempo.tempo);
}

export function detectBpm(samples: Float32Array, previousBpm: number): BpmResult {
  const volume = computeAverageVolume(samples);

  if (volume <= VOLUME_THRESHOLD) {
    return { bpm: previousBpm, volume };
  }

  try {
    return { bpm: detectTempo(samples), volume };
  } catch (error) {
    console.error('Error detecting tempo:', error);
    return { bpm: previousBpm, volume };
  }
}
