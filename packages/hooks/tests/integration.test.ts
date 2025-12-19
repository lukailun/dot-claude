import { test, expect, describe, beforeAll } from "bun:test";
import { processCommand } from "../src/processors/command";
import { processLinearReference } from "../src/processors/linear";
import { processVariation } from "../src/processors/variation";
import { getEnabledProcessors } from "../src/config";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";

describe("processors integration", () => {
  const testHome = join(import.meta.dir, "../test-home");
  const promptsDir = join(testHome, ".claude", "prompts");
  const templatePath = join(promptsDir, "variations.md");

  beforeAll(async () => {
    // Setup test environment
    process.env.CLAUDE_HOME = testHome;

    // Create test template for variation processor
    await mkdir(promptsDir, { recursive: true });
    await writeFile(
      templatePath,
      "Generate $count different solutions for: $instruction"
    );
  });

  describe("sequential processor execution", () => {
    test("should process command after linear (no actual linear call)", async () => {
      // This tests the order: linear -> command -> variation
      let prompt = "Create authentication system :code";

      // Simulate the processing chain
      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("为以下需求编写代码：Create authentication system");
    });

    test("should process variation after command", async () => {
      let prompt = "Implement sorting algorithm v(3)";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("Generate 3 different solutions for: Implement sorting algorithm");
    });

    test("should process command with variation", async () => {
      let prompt = "Design API v(5) :plan";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      // Command is processed first (:plan), then variation (v(5))
      expect(prompt).toBe("Generate 5 different solutions for: 针对以下内容，制定详细的分步计划：Design API");
    });

    test("should handle only command processor", async () => {
      let prompt = "Translate this text :zh";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("将以下内容翻译成中文：Translate this text");
    });

    test("should handle only variation processor", async () => {
      let prompt = "Optimize database queries v(4)";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("Generate 4 different solutions for: Optimize database queries");
    });

    test("should pass through if no processor matches", async () => {
      let prompt = "Just a regular prompt";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("Just a regular prompt");
    });
  });

  describe("complex processor combinations", () => {
    test("should handle variation before command (variation wins due to order)", async () => {
      let prompt = "Refactor code v(2) :review";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      // :review command is processed first, then v(2)
      expect(prompt).toBe("Generate 2 different solutions for: 为以下代码进行代码审查，指出问题和改进建议：Refactor code");
    });

    test("should handle multiple commands (only last one applies)", async () => {
      let prompt = "Some text :zh :en";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      // Only :en (the last command) is processed because commandProcessor uses endsWith
      expect(prompt).toBe("Translate the following into natural English: Some text :zh");
    });

    test("should preserve whitespace correctly through processors", async () => {
      let prompt = "  Create function  :code  ";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("为以下需求编写代码：Create function");
    });
  });

  describe("getEnabledProcessors integration", () => {
    test("should return all enabled processors in correct order", () => {
      const processors = getEnabledProcessors();

      expect(processors.length).toBeGreaterThan(0);
      expect(processors.every(p => p.enabled !== false)).toBe(true);

      // Verify processors have required properties
      processors.forEach(p => {
        expect(p.name).toBeDefined();
        expect(p.processor).toBeTypeOf('function');
      });
    });

    test("should execute all enabled processors sequentially", async () => {
      const processors = getEnabledProcessors();
      let prompt = "Build app :code";

      for (const { processor } of processors) {
        prompt = await processor(prompt);
      }

      expect(prompt).toBe("为以下需求编写代码：Build app");
    });
  });

  describe("real-world scenarios", () => {
    test("should handle code generation with variations", async () => {
      let prompt = "Implement binary search v(3) :code";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("Generate 3 different solutions for: 为以下需求编写代码：Implement binary search");
    });

    test("should handle explanation request", async () => {
      let prompt = "Quantum mechanics :explain";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("针对以下内容，使用通俗易懂的语言进行解释：Quantum mechanics");
    });

    test("should handle document generation with variations", async () => {
      let prompt = "API documentation v(2) :document";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("Generate 2 different solutions for: 为以下代码编写技术文档：API documentation");
    });

    test("should handle plain text with no processing", async () => {
      let prompt = "This is just a question about the codebase";

      prompt = await processLinearReference(prompt);
      prompt = processCommand(prompt);
      prompt = await processVariation(prompt);

      expect(prompt).toBe("This is just a question about the codebase");
    });
  });
});
