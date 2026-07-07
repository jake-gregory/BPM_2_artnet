declare module 'music-tempo' {
  class MusicTempo {
    constructor(audioData: Float32Array | number[], params?: Record<string, unknown>);
    // Beats-per-minute, formatted via `.toFixed(3)` by the library -- always a string.
    tempo: string;
    beatInterval: number;
    beats: number[];
  }

  export = MusicTempo;
}
