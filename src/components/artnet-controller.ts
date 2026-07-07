import artnetFactory from 'artnet';
import { ARTNET_HOST, ARTNET_UNIVERSE, ARTNET_CHANNEL } from '../config.js';

const artnet = artnetFactory({ host: ARTNET_HOST });

let beatInterval: NodeJS.Timeout | null = null;

export function updateBeatInterval(bpm: number): void {
  const beatTime = 60000 / bpm;

  if (beatInterval) {
    clearInterval(beatInterval);
  }

  beatInterval = setInterval(() => {
    //Send ArtNet pulse
    artnet.set(ARTNET_UNIVERSE, ARTNET_CHANNEL, 255);
    artnet.set(ARTNET_UNIVERSE, ARTNET_CHANNEL, 0);
  }, beatTime);
}
