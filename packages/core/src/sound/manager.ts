import type { SoundEffect, SoundEvent, SoundConfig } from "./types.js";

export class SoundManager {
  private config: SoundConfig = {
    enabled: true,
    volume: 50,
    effects: {
      start: null,
      complete: null,
      error: null,
      thinking: null,
      notification: null,
      typing: null,
      success: null,
      gobble: null,
    },
  };

  private audioContext: AudioContext | null = null;

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
    this.config.effects = {
      start: {
        id: "start",
        name: "Start",
        file: "start.mp3",
        volume: 60,
      },
      complete: {
        id: "complete",
        name: "Complete",
        file: "complete.mp3",
        volume: 70,
      },
      error: {
        id: "error",
        name: "Error",
        file: "error.mp3",
        volume: 80,
      },
      thinking: {
        id: "thinking",
        name: "Thinking",
        file: "thinking.mp3",
        volume: 30,
        loop: true,
      },
      notification: {
        id: "notification",
        name: "Notification",
        file: "notification.mp3",
        volume: 60,
      },
      typing: {
        id: "typing",
        name: "Typing",
        file: "typing.mp3",
        volume: 20,
      },
      success: {
        id: "success",
        name: "Success",
        file: "success.mp3",
        volume: 70,
      },
      gobble: {
        id: "gobble",
        name: "Gobble",
        file: "gobble.mp3",
        volume: 80,
      },
    };
  }

  async play(event: SoundEvent): Promise<void> {
    if (!this.config.enabled) return;

    const effect = this.config.effects[event];
    if (!effect) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const response = await fetch(`/sounds/${effect.file}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.loop = effect.loop || false;

      const volume = ((effect.volume || 50) / 100) * (this.config.volume / 100);
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.error(`Failed to play sound ${event}:`, error);
    }
  }

  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(100, volume));
  }

  getVolume(): number {
    return this.config.volume;
  }

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  setEffect(event: SoundEvent, effect: SoundEffect | null): void {
    this.config.effects[event] = effect;
  }

  getConfig(): SoundConfig {
    return { ...this.config };
  }

  async playGobble(): Promise<void> {
    await this.play("gobble");
  }

  async playThinking(): Promise<void> {
    await this.play("thinking");
  }

  async playComplete(): Promise<void> {
    await this.play("complete");
  }

  async playError(): Promise<void> {
    await this.play("error");
  }
}
