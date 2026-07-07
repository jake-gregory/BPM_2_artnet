import { execSync } from 'node:child_process';

const SWITCH_AUDIO_SOURCE = 'SwitchAudioSource';
const DEVICE_POLL_INTERVAL_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAvailableDevices(): string[] {
  try {
    return execSync(`${SWITCH_AUDIO_SOURCE} -a`).toString().trim().split('\n');
  } catch (error) {
    console.error('Error fetching audio devices:', error);
    return [];
  }
}

export async function waitForAudioDevice(inputDevice: string): Promise<boolean> {
  console.log('Checking for audio devices...');

  try {
    while (true) {
      const devices = getAvailableDevices();

      if (devices.includes(inputDevice)) {
        console.log(`\nSetting input device to: ${inputDevice}`);
        execSync(`${SWITCH_AUDIO_SOURCE} -t input -s "${inputDevice}"`);

        console.log('✅ Audio device set successfully!\n');
        return true;
      }

      console.log('Waiting for device to be available...');
      await sleep(DEVICE_POLL_INTERVAL_MS);
    }
  } catch (error) {
    console.error('Error setting audio device:', error);
    return false;
  }
}
