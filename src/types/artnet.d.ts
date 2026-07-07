declare module 'artnet' {
  interface ArtnetOptions {
    host?: string;
    port?: number;
    refresh?: number;
    iface?: string;
    sendAll?: boolean;
  }

  type ArtnetCallback = (err: Error | null, res: unknown) => void;

  interface ArtnetClient {
    set(universe: number, channel: number, value: number, callback?: ArtnetCallback): boolean;
    set(channel: number, value: number, callback?: ArtnetCallback): boolean;
    set(values: number[], callback?: ArtnetCallback): boolean;
    trigger(oem: number, subkey: number, key: number, callback?: ArtnetCallback): boolean;
    close(): void;
    setHost(host: string): void;
    setPort(port: number): void;
  }

  function artnet(options?: ArtnetOptions): ArtnetClient;

  export = artnet;
}
