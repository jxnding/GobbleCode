import { z } from "zod";

export const SoundEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  file: z.string(),
  volume: z.number().min(0).max(100).optional(),
  loop: z.boolean().optional(),
});
export type SoundEffect = z.infer<typeof SoundEffectSchema>;

export const SoundEventSchema = z.enum([
  "start",
  "complete",
  "error",
  "thinking",
  "notification",
  "typing",
  "success",
  "gobble",
]);
export type SoundEvent = z.infer<typeof SoundEventSchema>;

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  effects: Record<SoundEvent, SoundEffect | null>;
}
