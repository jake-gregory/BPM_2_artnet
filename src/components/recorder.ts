import { spawn } from 'node:child_process';

const SOX = 'sox';
const SAMPLE_RATE = '44100';
const CHANNELS = '2';
const BIT_DEPTH = '16';

export function recordAudio(outputFile: string, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const recordingProcess = spawn(SOX, [
      '-d',
      '-r',
      SAMPLE_RATE,
      '-c',
      CHANNELS,
      '-b',
      BIT_DEPTH,
      '-e',
      'signed-integer',
      outputFile,
    ]);

    setTimeout(() => {
      recordingProcess.kill();
      resolve();
    }, durationMs);
  });
}
