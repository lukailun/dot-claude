# Claude Code Adapter

适用于 Claude Code 的适配器。

## 功能

此适配器将 Claude Code 的 `UserPromptSubmit` hook 与 `@ai-dev-kit/hooks` 处理器集成。

## 使用方式

此适配器会被 `.claude/hooks/UserPromptSubmit.ts` 自动引用（通过包装层）。

## 工作原理

1. 从 stdin 读取 Claude Code 的输入（JSON 格式）
2. 提取 prompt 字段
3. 依次执行所有启用的处理器：
   - Linear Processor (处理 `linear(ISSUE-ID)`)
   - Command Processor (处理 `:zh`, `:code` 等命令)
   - Variation Processor (处理 `v(N)` 变体生成)
4. 将处理后的 prompt 输出到 stdout

## 错误处理

- 如果输入无效，输出错误信息到 stderr 并返回原始 prompt
- 如果处理器执行失败，会优雅降级并输出原始 prompt

## 依赖

- `@ai-dev-kit/core` - 核心类型定义
- `@ai-dev-kit/hooks` - 处理器实现
- `@anthropic-ai/claude-agent-sdk` - Claude Agent SDK
