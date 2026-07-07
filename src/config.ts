import { tmpdir } from 'node:os';
import { join } from 'node:path';

//Set your variables in here

//Audio input device name (must match a name from `SwitchAudioSource -a`)
export const INPUT_DEVICE = 'Scarlett 2i2 USB';

//Recording
export const OUTPUT_FILE = join(tmpdir(), 'bpm_2_artnet_recording.wav');
export const RECORD_DURATION_MS = 7000; //Length of each recorded sample
export const RESTART_DELAY_MS = 1000; //Pause between recording cycles

//BPM detection
export const DEFAULT_BPM = 130; //Used until the first successful detection
export const VOLUME_THRESHOLD = 0.07; //Below this average volume, a sample is treated as silence

//Art-Net output
export const ARTNET_HOST = '127.0.0.1'; //Change to your Art-Net node IP
export const ARTNET_UNIVERSE = 4;
export const ARTNET_CHANNEL = 1;
