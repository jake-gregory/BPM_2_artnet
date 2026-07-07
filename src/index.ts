import { readFile, unlink } from 'node:fs/promises';
import {
  INPUT_DEVICE,
  OUTPUT_FILE,
  RECORD_DURATION_MS,
  RESTART_DELAY_MS,
  DEFAULT_BPM,
  VOLUME_THRESHOLD,
} from './config.js';
import {
  waitForAudioDevice,
  recordAudio,
  parseWav,
  toMono,
  detectBpm,
  updateBeatInterval,
} from './components/index.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deleteIfExists(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {
    // nothing to clean up
  }
}

//Record -> decode -> detect
async function processRecording(previousBpm: number): Promise<number> {
  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(OUTPUT_FILE);
  } catch (error) {
    console.error('Error reading WAV file:', error);
    return previousBpm;
  }

  let samples: Float32Array;
  try {
    const decoded = parseWav(fileBuffer);
    samples = toMono(decoded.channels);
  } catch (error) {
    console.error('Error decoding audio data:', error);
    return previousBpm;
  }

  const { bpm, volume } = detectBpm(samples, previousBpm);
  if (volume <= VOLUME_THRESHOLD) {
    console.log('Audio level too low, using last known BPM:', previousBpm);
  } else {
    console.log('Detected BPM:', bpm);
  }

  updateBeatInterval(bpm);
  const nextBpm = bpm > 0 && bpm !== previousBpm ? bpm : previousBpm;

  try {
    await unlink(OUTPUT_FILE);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  return nextBpm;
}

async function main(): Promise<void> {
  await deleteIfExists(OUTPUT_FILE);

  const devicesReady = await waitForAudioDevice(INPUT_DEVICE);
  if (!devicesReady) {
    return;
  }

  let lastBpm = DEFAULT_BPM;
  console.log('Using default BPM:', lastBpm);
  updateBeatInterval(lastBpm);

  while (true) {
    await recordAudio(OUTPUT_FILE, RECORD_DURATION_MS);
    lastBpm = await processRecording(lastBpm);
    await sleep(RESTART_DELAY_MS);
  }
}

main().catch((error: unknown) => {
  console.error('Fatal error:', error);
});
