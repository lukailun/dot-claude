import { test, expect, describe, beforeAll } from "bun:test";
import { processVariation } from "../src/processors/variation";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";

describe("variationProcessor", () => {
  const testHome = join(import.meta.dir, "../test-home");
  const promptsDir = join(testHome, ".claude", "prompts");
  const templatePath = join(promptsDir, "variations.md");

  beforeAll(async () => {
    // Setup test environment
    const originalHome = process.env.CLAUDE_HOME;
    process.env.CLAUDE_HOME = testHome;

    // Create test template
    await mkdir(promptsDir, { recursive: true });
    await writeFile(
      templatePath,
      "Generate $count different solutions for: $instruction"
    );

    return () => {
      process.env.CLAUDE_HOME = originalHome;
    };
  });

  test("should process v(3) variation command", async () => {
    const input = "Sort an array v(3)";
    const result = await processVariation(input);
    expect(result).toBe("Generate 3 different solutions for: Sort an array");
  });

  test("should process v(5) variation command", async () => {
    const input = "Implement authentication v(5)";
    const result = await processVariation(input);
    expect(result).toBe("Generate 5 different solutions for: Implement authentication");
  });

  test("should process v(10) variation command", async () => {
    const input = "Design database schema v(10)";
    const result = await processVariation(input);
    expect(result).toBe("Generate 10 different solutions for: Design database schema");
  });

  test("should return original prompt if no v() pattern found", async () => {
    const input = "Just a regular prompt";
    const result = await processVariation(input);
    expect(result).toBe("Just a regular prompt");
  });

  test("should return original prompt if v() has no instruction", async () => {
    const input = "v(3)";
    const result = await processVariation(input);
    expect(result).toBe("v(3)");
  });

  test("should handle whitespace correctly", async () => {
    const input = "  Optimize performance  v(4)  ";
    const result = await processVariation(input);
    expect(result).toBe("Generate 4 different solutions for: Optimize performance");
  });

  test("should handle v() in middle of text", async () => {
    const input = "Create v(2) API endpoint";
    const result = await processVariation(input);
    expect(result).toBe("Generate 2 different solutions for: Create  API endpoint");
  });

  test("should handle single digit count", async () => {
    const input = "Refactor code v(1)";
    const result = await processVariation(input);
    expect(result).toBe("Generate 1 different solutions for: Refactor code");
  });

  test("should handle multi-digit count", async () => {
    const input = "Generate ideas v(99)";
    const result = await processVariation(input);
    expect(result).toBe("Generate 99 different solutions for: Generate ideas");
  });
});
