# BPM 2 Art-Net

Detects the live BPM of audio from an audio interface and pulses an Art-Net DMX channel in time with the beat.

## How it works

On a loop, it:

1. Records a short sample of audio from the configured input device
2. Decodes it and checks the volume — if it's too quiet, the last known BPM is kept
3. Otherwise detects the tempo and reschedules a pulse on an Art-Net channel to match it
4. Repeats

## Prerequisites

- macOS (it uses `SwitchAudioSource`, which is macOS-only)
- Node.js 24+
- [`sox`](http://sox.sourceforge.net/) and [`SwitchAudioSource`](https://github.com/deweller/switchaudio-osx) available on your `PATH`:
  ```sh
  brew install sox switchaudio-osx
  ```
  (`npm install` checks for both and prints a reminder if either is missing)
- An Art-Net node reachable at the host configured in `src/config.ts` (defaults to `127.0.0.1`)

## Setup

```sh
npm install
```

Every value you're likely to want to change for your own setup — audio device names, Art-Net host/universe/channel, volume threshold, default BPM, timing — lives in one place: [`src/config.ts`](src/config.ts).

## Running

```sh
npm start
```

This builds the TypeScript and runs it. It will wait for your configured input device to become available, switch to it, then start the record → detect → pulse loop until you stop it (Ctrl+C).

## Development

| Command                  | What it does                       |
| ------------------------ | ----------------------------------- |
| `npm run type-check`      | Type-checks without emitting        |
| `npm run lint`            | Lints                               |
| `npm run lint:fix`        | Lints and auto-fixes                |
| `npm run format`          | Formats with Prettier               |
| `npm run test`            | Runs the unit tests                 |
| `npm run test:watch`      | Runs the unit tests in watch mode   |
| `npm run build`           | Compiles to `dist/`                 |

A pre-commit hook (Husky + lint-staged) runs formatting, linting, and type-checking automatically on staged files.

## Project structure

```
src/
├── config.ts                 # every value you'd want to tune
├── index.ts                  # entry point: orchestrates the loop
├── types/                    # ambient type declarations for untyped dependencies
└── components/
    ├── wav.ts                # WAV/PCM file parsing
    ├── bpm.ts                # volume gating + tempo detection
    ├── audio-devices.ts      # switches the macOS input device
    ├── recorder.ts           # records audio via sox
    └── artnet-controller.ts  # sends the beat-synced Art-Net pulse
```

## License

MIT — see [LICENSE](LICENSE).
