# @ai-dev-kit/adapters

AI-Dev-Kit 的平台适配器包，为不同 AI IDE 提供统一的集成接口。

## 功能

### Claude Code 适配器

为 Claude Code 提供 UserPromptSubmit Hook 适配器，自动处理用户输入的 prompt。

#### 文件位置

```
packages/adapters/claude/UserPromptSubmit.ts
```

#### 工作原理

1. 从 stdin 读取 JSON 格式的 hook 输入
2. 提取 prompt 字符串
3. 通过所有启用的处理器处理 prompt
4. 输出处理后的结果到 stdout

#### 代码示例

```typescript
import type { UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk";
import { getEnabledProcessors } from "@ai-dev-kit/hooks";

try {
  const input = await Bun.stdin.json() as UserPromptSubmitHookInput;
  const { prompt } = input;

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('无效的提示词输入');
  }

  const processors = getEnabledProcessors();

  let processedPrompt = prompt;
  for (const { processor } of processors) {
    processedPrompt = await processor(processedPrompt);
  }

  console.log(processedPrompt);

} catch (error) {
  console.error('处理过程中发生错误:', error instanceof Error ? error.message : String(error));
  console.log(prompt ?? '');
}
```

### Cursor 适配器（预留）

Cursor IDE 适配器的占位目录，待实现。

```
packages/adapters/cursor/
```

## 安装

这个包作为 AI-Dev-Kit monorepo 的一部分，通过 workspace 依赖使用：

```json
{
  "dependencies": {
    "@ai-dev-kit/core": "workspace:*",
    "@ai-dev-kit/hooks": "workspace:*",
    "@ai-dev-kit/adapters": "workspace:*"
  }
}
```

## 使用方式

### Claude Code

适配器通过 `.claude/hooks/UserPromptSubmit.ts` 自动引用。确保你的 `~/.claude/settings.json` 配置正确：

```json
{
  "hooks": {
    "UserPromptSubmit": "$HOME/.claude/hooks/UserPromptSubmit.ts"
  }
}
```

### 直接使用

你也可以直接运行适配器：

```bash
echo '{"prompt": "Hello World :zh"}' | bun packages/adapters/claude/UserPromptSubmit.ts
# 输出: 将以下内容翻译成中文：Hello World
```

## 开发指南

### 添加新平台适配器

1. 在 `packages/adapters/` 创建新目录：

```bash
mkdir -p packages/adapters/your-platform
```

2. 创建适配器入口文件：

```typescript
// packages/adapters/your-platform/hook.ts
import { getEnabledProcessors } from "@ai-dev-kit/hooks";

export async function processInput(input: YourPlatformInput): Promise<string> {
  const processors = getEnabledProcessors();

  let result = input.prompt;
  for (const { processor } of processors) {
    result = await processor(result);
  }

  return result;
}
```

3. 在 `package.json` 添加导出：

```json
{
  "exports": {
    "./claude": "./claude/UserPromptSubmit.ts",
    "./your-platform": "./your-platform/hook.ts"
  }
}
```

### 适配器设计原则

1. **平台隔离** - 每个平台的特定代码独立在各自目录
2. **统一接口** - 使用 `@ai-dev-kit/hooks` 提供的统一处理器接口
3. **错误处理** - 确保错误不会导致 IDE 崩溃
4. **性能优化** - 避免不必要的等待和计算

## 测试

适配器的功能通过 hooks 包的集成测试覆盖。你可以手动测试适配器：

```bash
# 测试翻译
echo '{"prompt": "Hello :zh"}' | bun packages/adapters/claude/UserPromptSubmit.ts

# 测试代码生成
echo '{"prompt": "Sort array :code"}' | bun packages/adapters/claude/UserPromptSubmit.ts

# 测试变体生成
echo '{"prompt": "Design API v(3)"}' | bun packages/adapters/claude/UserPromptSubmit.ts

# 测试组合
echo '{"prompt": "Auth system v(2) :code"}' | bun packages/adapters/claude/UserPromptSubmit.ts
```

## 依赖

- `@ai-dev-kit/core` - 核心类型
- `@ai-dev-kit/hooks` - 处理器实现
- `@anthropic-ai/claude-agent-sdk` - Claude Code SDK（仅 claude 适配器）

## 路线图

- [x] Claude Code 适配器
- [ ] Cursor 适配器
- [ ] VS Code 扩展适配器
- [ ] JetBrains IDE 适配器
- [ ] API 服务器适配器（独立服务）

## 许可证

MIT
