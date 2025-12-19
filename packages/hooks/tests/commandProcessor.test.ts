import { test, expect, describe } from "bun:test";
import { processCommand } from "../src/processors/command";

describe("commandProcessor", () => {
  test("should add prefix for :zh command", () => {
    const input = "Hello World :zh";
    const result = processCommand(input);
    expect(result).toBe("将以下内容翻译成中文：Hello World");
  });

  test("should add prefix for :en command", () => {
    const input = "你好世界 :en";
    const result = processCommand(input);
    expect(result).toBe("Translate the following into natural English: 你好世界");
  });

  test("should add prefix for :plan command", () => {
    const input = "Build a web app :plan";
    const result = processCommand(input);
    expect(result).toBe("针对以下内容，制定详细的分步计划：Build a web app");
  });

  test("should add prefix for :explain command", () => {
    const input = "Quantum computing :explain";
    const result = processCommand(input);
    expect(result).toBe("针对以下内容，使用通俗易懂的语言进行解释：Quantum computing");
  });

  test("should add prefix for :summarize command", () => {
    const input = "Long article content :summarize";
    const result = processCommand(input);
    expect(result).toBe("针对以下内容，进行总结：Long article content");
  });

  test("should add prefix for :analyze command", () => {
    const input = "Market trends :analyze";
    const result = processCommand(input);
    expect(result).toBe("针对以下内容，进行简要分析，指出核心问题和解决方向：Market trends");
  });

  test("should add prefix for :improve command", () => {
    const input = "This is rough text :improve";
    const result = processCommand(input);
    expect(result).toBe("优化以下文本的表达，使其更流畅专业：This is rough text");
  });

  test("should add prefix for :code command", () => {
    const input = "Sort array function :code";
    const result = processCommand(input);
    expect(result).toBe("为以下需求编写代码：Sort array function");
  });

  test("should add prefix for :comment command", () => {
    const input = "function foo() {} :comment";
    const result = processCommand(input);
    expect(result).toBe("为以下代码添加详细的注释：function foo() {}");
  });

  test("should add prefix for :debug command", () => {
    const input = "Error in login flow :debug";
    const result = processCommand(input);
    expect(result).toBe("针对以下内容，进行调试分析并提供解决方案：Error in login flow");
  });

  test("should add prefix for :refactor command", () => {
    const input = "Legacy code :refactor";
    const result = processCommand(input);
    expect(result).toBe("重构以下代码，提高可读性和性能：Legacy code");
  });

  test("should add prefix for :test command", () => {
    const input = "Login function :test";
    const result = processCommand(input);
    expect(result).toBe("为以下代码编写测试用例：Login function");
  });

  test("should add prefix for :document command", () => {
    const input = "API endpoints :document";
    const result = processCommand(input);
    expect(result).toBe("为以下代码编写技术文档：API endpoints");
  });

  test("should add prefix for :review command", () => {
    const input = "Pull request code :review";
    const result = processCommand(input);
    expect(result).toBe("为以下代码进行代码审查，指出问题和改进建议：Pull request code");
  });

  test("should return original prompt if no command found", () => {
    const input = "Just a regular prompt";
    const result = processCommand(input);
    expect(result).toBe("Just a regular prompt");
  });

  test("should return original prompt if command is at start", () => {
    const input = ":zh Hello World";
    const result = processCommand(input);
    expect(result).toBe(":zh Hello World");
  });

  test("should return original prompt if only command with no task", () => {
    const input = ":zh";
    const result = processCommand(input);
    expect(result).toBe(":zh");
  });

  test("should handle whitespace correctly", () => {
    const input = "  Hello World  :zh  ";
    const result = processCommand(input);
    expect(result).toBe("将以下内容翻译成中文：Hello World");
  });

  test("should handle command with spaces before it", () => {
    const input = "Translate this :en";
    const result = processCommand(input);
    expect(result).toBe("Translate the following into natural English: Translate this");
  });
});
