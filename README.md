# BPM_2_artnet

This project is a small Node.js script that continuously detects the live BPM of an audio input and pulses an Art-Net DMX channel in time with every beat. This can then be used in DMX software like QLC+ to ensure lighting is in time with the music.

## How it works

Each loop:

1. Records a short sample of audio from the configured input device
2. Decodes and checks the volume. If the audio level it's too low, the last known BPM is used
3. Otherwise the tempo is detected and a pulse is sent on every beat to an Art-Net channel of your choice

## Prerequisites

- macOS (it uses `SwitchAudioSource`, which is macOS-only)
- Node.js 20+
- [`sox`](http://sox.sourceforge.net/) and [`SwitchAudioSource`](https://github.com/deweller/switchaudio-osx) available on your `PATH`:
  ```sh
  brew install sox switchaudio-osx
  ```
  (`npm install` checks both are present)
- An Art-Net node (defaults to `127.0.0.1`)

## Setup

```sh
npm install
```

Configurable values can be found in [`src/config.ts`](src/config.ts). This includes audio input device names, Art-Net host/universe/channel, volume threshold, default BPM and timing.


## Running

```sh
npm start
```

This command will compile the TypeScript and run the generated JavaScript. Once the configured input device becomes available, the script will switch to it and start the record → detect → pulse loop until you stop it (Ctrl+C).

## License

MIT — see [LICENSE](LICENSE).
