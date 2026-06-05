import { describe, it, expect } from "vitest";
import { hintClass } from "./hintClass.js";
import { isUtilityClass } from "../components/hints/hintTarget.js";

describe("hintClass", () => {
  it("builds stable hint-* class names", () => {
    expect(hintClass("SettingsView", "hints-toggle")).toBe("hint-settings-view-hints-toggle");
    expect(hintClass("models-settings", "provider-deepseek")).toBe(
      "hint-models-settings-provider-deepseek",
    );
  });
});

describe("isUtilityClass", () => {
  it("treats tailwind utilities as non-identifiers", () => {
    expect(isUtilityClass("inline-flex")).toBe(true);
    expect(isUtilityClass("px-3")).toBe(true);
    expect(isUtilityClass("text-[var(--text-muted)]")).toBe(true);
  });

  it("keeps hint-* classes as identifiers", () => {
    expect(isUtilityClass("hint-agent-editor-save")).toBe(false);
  });
});
