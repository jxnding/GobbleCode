import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { v4 as uuid } from "uuid";
import type { Skill, SkillSearchResult, SkillCategory } from "./types.js";

const SKILLS_DIR = join(homedir(), ".config", "gobblecode", "skills");

export class SkillManager {
  private skills: Map<string, Skill> = new Map();

  async load(): Promise<void> {
    try {
      await mkdir(SKILLS_DIR, { recursive: true });
      const entries = await readdir(SKILLS_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = join(SKILLS_DIR, entry.name);
          const skill = await this.loadSkillFromDir(skillPath, entry.name);
          if (skill) {
            this.skills.set(skill.id, skill);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  }

  private async loadSkillFromDir(
    dirPath: string,
    dirName: string
  ): Promise<Skill | null> {
    try {
      const mdPath = join(dirPath, "SKILL.md");
      const content = await readFile(mdPath, "utf-8");

      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const descMatch = content.match(/^description:\s*(.+)$/m);
      const categoryMatch = content.match(/^category:\s*(.+)$/m);

      return {
        id: dirName,
        name: nameMatch?.[1] || dirName,
        description: descMatch?.[1] || "",
        category: (categoryMatch?.[1] as SkillCategory) || "custom",
        version: "1.0.0",
        location: dirPath,
        instructions: content,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  listSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  searchSkills(query: string): SkillSearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: SkillSearchResult[] = [];

    for (const skill of this.skills.values()) {
      if (!skill.enabled) continue;

      let relevance = 0;
      const matchedTags: string[] = [];

      if (skill.name.toLowerCase().includes(lowerQuery)) relevance += 10;
      if (skill.description.toLowerCase().includes(lowerQuery)) relevance += 5;

      for (const tag of skill.tags || []) {
        if (tag.toLowerCase().includes(lowerQuery)) {
          relevance += 3;
          matchedTags.push(tag);
        }
      }

      if (skill.instructions.toLowerCase().includes(lowerQuery)) relevance += 1;

      if (relevance > 0) {
        results.push({ skill, relevance, matchedTags });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  async enableSkill(id: string): Promise<boolean> {
    const skill = this.skills.get(id);
    if (!skill) return false;
    skill.enabled = true;
    return true;
  }

  async disableSkill(id: string): Promise<boolean> {
    const skill = this.skills.get(id);
    if (!skill) return false;
    skill.enabled = false;
    return true;
  }

  getSkillsDir(): string {
    return SKILLS_DIR;
  }
}
