export interface DecodedWav {
  sampleRate: number;
  numberOfChannels: number;
  length: number;
  channels: Float32Array[];
}

const BYTES_PER_SAMPLE = 2;

export function parseWav(buffer: Buffer): DecodedWav {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Not a RIFF/WAVE file');
  }

  let offset = 12;
  let audioFormat: number | undefined;
  let numberOfChannels: number | undefined;
  let sampleRate: number | undefined;
  let bitsPerSample: number | undefined;
  let dataStart = -1;
  let declaredDataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const bodyStart = offset + 8;

    if (chunkId === 'fmt ') {
      audioFormat = buffer.readUInt16LE(bodyStart);
      numberOfChannels = buffer.readUInt16LE(bodyStart + 2);
      sampleRate = buffer.readUInt32LE(bodyStart + 4);
      bitsPerSample = buffer.readUInt16LE(bodyStart + 14);
    } else if (chunkId === 'data') {
      dataStart = bodyStart;
      declaredDataSize = chunkSize;
      break;
    }

    offset = bodyStart + chunkSize + (chunkSize % 2);
  }

  if (sampleRate === undefined || numberOfChannels === undefined || bitsPerSample === undefined) {
    throw new Error('Missing fmt chunk');
  }
  if (dataStart < 0) {
    throw new Error('Missing data chunk');
  }
  if (audioFormat !== 1) {
    throw new Error(`Unsupported WAV audio format: ${audioFormat}`);
  }
  if (bitsPerSample !== 16) {
    throw new Error(`Unsupported bit depth: ${bitsPerSample}`);
  }

  const availableBytes = buffer.length - dataStart;
  const dataSize =
    declaredDataSize > 0 && declaredDataSize <= availableBytes ? declaredDataSize : availableBytes;

  const frameSize = numberOfChannels * BYTES_PER_SAMPLE;
  const length = Math.floor(dataSize / frameSize);

  const channels: Float32Array[] = [];
  for (let channel = 0; channel < numberOfChannels; channel++) {
    channels.push(new Float32Array(length));
  }

  for (let frame = 0; frame < length; frame++) {
    const frameOffset = dataStart + frame * frameSize;
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sampleOffset = frameOffset + channel * BYTES_PER_SAMPLE;
      channels[channel][frame] = buffer.readInt16LE(sampleOffset) / 32768;
    }
  }

  return { sampleRate, numberOfChannels, length, channels };
}

export function toMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 2) {
    const [ch1, ch2] = channels;
    const mono = new Float32Array(ch1.length);
    for (let i = 0; i < ch1.length; i++) {
      mono[i] = (ch1[i] + ch2[i]) / 2;
    }
    return mono;
  }

  return channels[0];
}
