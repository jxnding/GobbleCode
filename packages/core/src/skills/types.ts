import { z } from "zod";

export const SkillCategorySchema = z.enum([
  "software-development",
  "web-development",
  "data-science",
  "devops",
  "testing",
  "documentation",
  "automation",
  "custom",
]);
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: SkillCategorySchema,
  version: z.string(),
  author: z.string().optional(),
  location: z.string(),
  instructions: z.string(),
  dependencies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const SkillRegistrySchema = z.object({
  skills: z.array(SkillSchema),
  lastSync: z.string().datetime().optional(),
});
export type SkillRegistry = z.infer<typeof SkillRegistrySchema>;

export interface SkillSearchResult {
  skill: Skill;
  relevance: number;
  matchedTags: string[];
}
