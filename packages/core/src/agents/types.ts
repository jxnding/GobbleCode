import { z } from "zod";

export const AgentModeSchema = z.enum(["build", "plan", "custom"]);
export type AgentMode = z.infer<typeof AgentModeSchema>;

export const AgentToolSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  permissions: z.array(z.string()).optional(),
});
export type AgentTool = z.infer<typeof AgentToolSchema>;

export const AgentNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["start", "end", "tool", "condition", "transform", "agent"]),
  label: z.string(),
  config: z.record(z.unknown()).optional(),
  position: z.object({ x: z.number(), y: z.number() }),
});
export type AgentNode = z.infer<typeof AgentNodeSchema>;

export const AgentEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});
export type AgentEdge = z.infer<typeof AgentEdgeSchema>;

export const AgentGraphSchema = z.object({
  nodes: z.array(AgentNodeSchema),
  edges: z.array(AgentEdgeSchema),
});
export type AgentGraph = z.infer<typeof AgentGraphSchema>;

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  mode: AgentModeSchema,
  model: z.string().optional(),
  systemPrompt: z.string(),
  tools: z.array(AgentToolSchema),
  graph: AgentGraphSchema.optional(),
  subagents: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateAgent = z.infer<typeof CreateAgentSchema>;
