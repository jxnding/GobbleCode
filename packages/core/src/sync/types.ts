import { z } from "zod";

export const SyncItemSchema = z.object({
  id: z.string(),
  type: z.enum(["agent", "model", "skill", "config"]),
  data: z.unknown(),
  version: z.number(),
  lastModified: z.string().datetime(),
  checksum: z.string(),
});
export type SyncItem = z.infer<typeof SyncItemSchema>;

export const SyncStateSchema = z.object({
  lastSync: z.string().datetime().optional(),
  pendingChanges: z.array(SyncItemSchema),
  conflictResolution: z.enum(["local", "remote", "merge"]).default("merge"),
});
export type SyncState = z.infer<typeof SyncStateSchema>;

export const SyncResponseSchema = z.object({
  success: z.boolean(),
  items: z.array(SyncItemSchema),
  conflicts: z.array(
    z.object({
      local: SyncItemSchema,
      remote: SyncItemSchema,
    })
  ).optional(),
  timestamp: z.string().datetime(),
});
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
