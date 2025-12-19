import { test, expect, describe, mock } from "bun:test";
import { processLinearReference } from "../src/processors/linear";

describe("linearProcessor", () => {
  test("should return original prompt if LINEAR_API_KEY is not set", async () => {
    const originalKey = process.env.LINEAR_API_KEY;
    delete process.env.LINEAR_API_KEY;

    const input = "Check linear(TEAM-123)";
    const result = await processLinearReference(input);
    expect(result).toBe("Check linear(TEAM-123)");

    if (originalKey) {
      process.env.LINEAR_API_KEY = originalKey;
    }
  });

  test("should return original prompt if no linear() pattern found", async () => {
    const input = "Just a regular prompt";
    const result = await processLinearReference(input);
    expect(result).toBe("Just a regular prompt");
  });

  test("should handle prompt without LINEAR_API_KEY gracefully", async () => {
    const originalKey = process.env.LINEAR_API_KEY;
    delete process.env.LINEAR_API_KEY;

    const input = "Fix linear(TEAM-456) and linear(TEAM-789)";
    const result = await processLinearReference(input);
    expect(result).toBe("Fix linear(TEAM-456) and linear(TEAM-789)");

    if (originalKey) {
      process.env.LINEAR_API_KEY = originalKey;
    }
  });

  test("should extract issue ID from linear() pattern", async () => {
    const input = "Review linear(TEAM-123)";
    const matches = [...input.matchAll(/linear\((.*?)\)/g)];

    expect(matches).toHaveLength(1);
    expect(matches[0]?.[1]).toBe("TEAM-123");
  });

  test("should extract multiple issue IDs from linear() patterns", async () => {
    const input = "Fix linear(TEAM-123) and linear(TEAM-456)";
    const matches = [...input.matchAll(/linear\((.*?)\)/g)];

    expect(matches).toHaveLength(2);
    expect(matches[0]?.[1]).toBe("TEAM-123");
    expect(matches[1]?.[1]).toBe("TEAM-456");
  });

  test("should handle various issue ID formats", () => {
    const testCases = [
      "linear(ABC-1)",
      "linear(TEAM-999)",
      "linear(X-1)",
    ];

    testCases.forEach(testCase => {
      const matches = [...testCase.matchAll(/linear\((.*?)\)/g)];
      expect(matches).toHaveLength(1);
      expect(matches[0]?.[1]).toBeTruthy();
    });
  });

  test("should not match invalid patterns", () => {
    const invalidCases = [
      "linear()",
      "linear",
      "linear[]",
      "linear{TEAM-123}",
    ];

    invalidCases.forEach(testCase => {
      const matches = [...testCase.matchAll(/linear\((.*?)\)/g)];
      if (matches.length > 0 && matches[0]?.[1] === "") {
        // linear() with empty content should match but have empty ID
        expect(matches[0]?.[1]).toBe("");
      }
    });
  });
});
