import { describe, expect, it } from 'vitest';
import { parseWav, toMono } from './wav.js';

function buildWav(options: {
  numChannels: number;
  sampleRate: number;
  frames: number[][]; //Frames[channel] = samples for that channel
  extraChunk?: { id: string; body: Buffer };
  declaredDataSize?: number; //Override, to simulate a placeholder size
  truncateDataBytes?: number; //Simulate a file cut short of its declared size
}): Buffer {
  const { numChannels, sampleRate, frames, extraChunk, declaredDataSize, truncateDataBytes } =
    options;
  const numFrames = frames[0].length;
  const bytesPerSample = 2;
  const frameSize = numChannels * bytesPerSample;

  const data = Buffer.alloc(numFrames * frameSize);
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      data.writeInt16LE(frames[c][i], i * frameSize + c * bytesPerSample);
    }
  }

  const dataChunk = Buffer.concat([
    Buffer.from('data', 'ascii'),
    (() => {
      const sizeField = Buffer.alloc(4);
      sizeField.writeUInt32LE(declaredDataSize ?? data.length, 0);
      return sizeField;
    })(),
    truncateDataBytes !== undefined ? data.subarray(0, truncateDataBytes) : data,
  ]);

  const fmtBody = Buffer.alloc(16);
  fmtBody.writeUInt16LE(1, 0);
  fmtBody.writeUInt16LE(numChannels, 2);
  fmtBody.writeUInt32LE(sampleRate, 4);
  fmtBody.writeUInt32LE(sampleRate * frameSize, 8);
  fmtBody.writeUInt16LE(frameSize, 12);
  fmtBody.writeUInt16LE(16, 14); //Bits per sample
  const fmtChunk = Buffer.concat([
    Buffer.from('fmt ', 'ascii'),
    (() => {
      const sizeField = Buffer.alloc(4);
      sizeField.writeUInt32LE(fmtBody.length, 0);
      return sizeField;
    })(),
    fmtBody,
  ]);

  const extra = extraChunk
    ? Buffer.concat([
        Buffer.from(extraChunk.id, 'ascii'),
        (() => {
          const sizeField = Buffer.alloc(4);
          sizeField.writeUInt32LE(extraChunk.body.length, 0);
          return sizeField;
        })(),
        extraChunk.body,
        Buffer.alloc(extraChunk.body.length % 2),
      ])
    : Buffer.alloc(0);

  const body = Buffer.concat([Buffer.from('WAVE', 'ascii'), fmtChunk, extra, dataChunk]);

  const riffSize = Buffer.alloc(4);
  riffSize.writeUInt32LE(body.length, 0);

  return Buffer.concat([Buffer.from('RIFF', 'ascii'), riffSize, body]);
}

describe('parseWav', () => {
  it('decodes a canonical stereo 16-bit PCM WAV', () => {
    const wav = buildWav({
      numChannels: 2,
      sampleRate: 44100,
      frames: [
        [0, 100, -100, 32767, -32768],
        [0, -50, 50, 32767, -32768],
      ],
    });

    const decoded = parseWav(wav);

    expect(decoded.sampleRate).toBe(44100);
    expect(decoded.numberOfChannels).toBe(2);
    expect(decoded.length).toBe(5);
    expect(Array.from(decoded.channels[0])).toEqual([
      0,
      100 / 32768,
      -100 / 32768,
      32767 / 32768,
      -1,
    ]);
    expect(Array.from(decoded.channels[1])).toEqual([
      0,
      -50 / 32768,
      50 / 32768,
      32767 / 32768,
      -1,
    ]);
  });

  it('skips unknown chunks before locating the data chunk', () => {
    const wav = buildWav({
      numChannels: 1,
      sampleRate: 8000,
      frames: [[10, 20, 30]],
      extraChunk: { id: 'LIST', body: Buffer.from('some metadata!!', 'ascii') },
    });

    const decoded = parseWav(wav);

    expect(decoded.numberOfChannels).toBe(1);
    expect(decoded.length).toBe(3);
    expect(Array.from(decoded.channels[0])).toEqual([10 / 32768, 20 / 32768, 30 / 32768]);
  });

  it('falls back to the actual buffer length when the declared data size is a bogus placeholder', () => {
    //Mirrors sox writing a max-value data-chunk size when the recording process is killed instead of closed cleanly
    const wav = buildWav({
      numChannels: 1,
      sampleRate: 44100,
      frames: [[1, 2, 3, 4]],
      declaredDataSize: 0x7fffffff,
    });

    const decoded = parseWav(wav);

    expect(decoded.length).toBe(4);
    expect(Array.from(decoded.channels[0])).toEqual([1 / 32768, 2 / 32768, 3 / 32768, 4 / 32768]);
  });

  it('drops a trailing partial frame if the file is truncated mid-frame', () => {
    const wav = buildWav({
      numChannels: 2,
      sampleRate: 44100,
      frames: [
        [1, 2, 3],
        [1, 2, 3],
      ],
      truncateDataBytes: 3 * 4 - 1, //ne byte short of the last frame
    });

    const decoded = parseWav(wav);

    expect(decoded.length).toBe(2);
  });

  it('throws on a non-WAV buffer', () => {
    expect(() => parseWav(Buffer.from('not a wav file at all here'))).toThrow();
  });
});

describe('toMono', () => {
  it('averages two channels', () => {
    const mono = toMono([new Float32Array([1, 0, -1]), new Float32Array([-1, 0, 1])]);
    expect(Array.from(mono)).toEqual([0, 0, 0]);
  });

  it('passes a single channel through unchanged', () => {
    const channel = new Float32Array([0.5, -0.25]);
    expect(toMono([channel])).toBe(channel);
  });
});
