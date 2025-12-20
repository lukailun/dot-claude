# @ai-dev-kit/hooks

AI-Dev-Kit 的核心处理器和命令配置包。

## 功能

### 处理器 (Processors)

#### Command Processor

处理命令后缀（如 `:zh`、`:code`、`:test` 等）。

```typescript
import { processCommand } from '@ai-dev-kit/hooks/processors';

const result = processCommand('Hello World :zh');
// 返回: '将以下内容翻译成中文：Hello World'
```

#### Linear Processor

处理 Linear Issue 引用，自动获取 Issue 详情。

```typescript
import { processLinearReference } from '@ai-dev-kit/hooks/processors';

// 需要在 ~/.claude/.env 中配置 LINEAR_API_KEY
const result = await processLinearReference('Fix LINEAR-123');
// 返回: 'Fix LINEAR-123\n\n[Issue Title]\n[Issue Description]...'
```

#### Variation Processor

生成多个解决方案变体。

```typescript
import { processVariation } from '@ai-dev-kit/hooks/processors';

const result = await processVariation('Sort an array v(3)');
// 返回: 包含3种解决方案的详细模板
```

### 命令配置 (Commands)

#### 翻译类命令

```typescript
import { TRANSLATION } from '@ai-dev-kit/hooks/commands';

// TRANSLATION 包含:
// :zh - 翻译成中文
// :en - 翻译成英文
```

#### 代码开发类命令

```typescript
import { CODE_DEVELOPMENT } from '@ai-dev-kit/hooks/commands';

// CODE_DEVELOPMENT 包含:
// :code - 编写代码
// :debug - 调试代码
// :review - 代码审查
// :test - 编写测试
// :refactor - 重构代码
// :doc - 编写文档
// :fix - 修复问题
```

#### 文本处理类命令

```typescript
import { TEXT_PROCESSING } from '@ai-dev-kit/hooks/commands';

// TEXT_PROCESSING 包含:
// :summary - 总结
// :format - 格式化
// :optimize - 优化
// :expand - 扩展
// :simplify - 简化
```

#### 所有命令

```typescript
import { COMMANDS, type CommandKey } from '@ai-dev-kit/hooks/commands';

// COMMANDS 包含所有命令的合集
// CommandKey 是所有命令键的联合类型
```

### 配置管理

#### 获取启用的处理器

```typescript
import { getEnabledProcessors } from '@ai-dev-kit/hooks';

const processors = getEnabledProcessors();
// 返回所有 enabled=true 的处理器配置
```

#### 处理器配置数组

```typescript
import { AVAILABLE_PROCESSORS } from '@ai-dev-kit/hooks';

// 默认配置（按执行顺序）:
// 1. Linear Processor
// 2. Command Processor
// 3. Variation Processor
```

## 安装

这个包作为 AI-Dev-Kit monorepo 的一部分，通过 workspace 依赖使用：

```json
{
  "dependencies": {
    "@ai-dev-kit/core": "workspace:*",
    "@ai-dev-kit/hooks": "workspace:*"
  }
}
```

## 使用示例

### 基础使用

```typescript
import { getEnabledProcessors } from '@ai-dev-kit/hooks';

async function processPrompt(prompt: string): Promise<string> {
  const processors = getEnabledProcessors();

  let result = prompt;
  for (const { processor } of processors) {
    result = await processor(result);
  }

  return result;
}

// 测试
await processPrompt('Hello World :zh');
// → '将以下内容翻译成中文：Hello World'

await processPrompt('Sort array v(3) :code');
// → 生成3种代码方案
```

### 单独使用处理器

```typescript
import { processCommand } from '@ai-dev-kit/hooks/processors';

const translated = processCommand('Hello :zh');
// → '将以下内容翻译成中文：Hello'

const coded = processCommand('Create auth :code');
// → '为以下需求编写代码：Create auth'
```

### 自定义命令

```typescript
import { COMMANDS } from '@ai-dev-kit/hooks/commands';

// 添加新命令（在你的代码中）
const myCommands = {
  ...COMMANDS,
  ':custom': {
    prefix: '自定义处理：',
    description: '我的自定义命令'
  }
};
```

## 环境配置

在 `~/.claude/.env` 中配置：

```env
# Linear API Key（可选）
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
```

你也可以自定义 Claude 配置目录：

```bash
export CLAUDE_HOME=/path/to/custom/claude/home
```

## 测试

```bash
# 运行所有测试
bun test

# 运行特定测试文件
bun test tests/command.test.ts
```

测试覆盖：
- ✅ 50+ 个测试用例
- ✅ 单元测试（每个处理器）
- ✅ 集成测试（处理器链）
- ✅ 边缘情况测试

## 处理器执行流程

```
用户输入
  ↓
Linear Processor (处理 LINEAR-XXX 引用)
  ↓
Command Processor (处理 :command 后缀)
  ↓
Variation Processor (处理 v(n) 变体)
  ↓
最终输出
```

## 扩展开发

### 添加新命令

1. 编辑 `src/commands/` 下的相应文件：

```typescript
// src/commands/my-commands.ts
import type { CommandRegistry } from '@ai-dev-kit/core';

export const MY_COMMANDS: CommandRegistry = {
  ':mycmd': {
    prefix: '我的命令：',
    description: '命令描述'
  }
};
```

2. 在 `src/commands/index.ts` 导出：

```typescript
export { MY_COMMANDS } from './my-commands';

export const COMMANDS = {
  ...TRANSLATION,
  ...CODE_DEVELOPMENT,
  ...TEXT_PROCESSING,
  ...MY_COMMANDS  // 添加这行
} as const satisfies CommandRegistry;
```

### 添加新处理器

1. 创建处理器文件：

```typescript
// src/processors/my-processor.ts
import type { Processor } from '@ai-dev-kit/core';

export const processMyFeature: Processor = async (prompt: string): Promise<string> => {
  // 你的逻辑
  if (!prompt.includes('特殊标记')) {
    return prompt;
  }

  // 处理并返回
  return `处理后的: ${prompt}`;
};
```

2. 在 `src/config.ts` 注册：

```typescript
import { processMyFeature } from './processors/my-processor';

export const AVAILABLE_PROCESSORS: ProcessorConfig[] = [
  { name: 'linear', processor: processLinearReference, enabled: true },
  { name: 'my-feature', processor: processMyFeature, enabled: true },  // 添加
  { name: 'command', processor: processCommand, enabled: true },
  { name: 'variation', processor: processVariation, enabled: true }
];
```

3. 编写测试：

```typescript
// tests/my-processor.test.ts
import { test, expect } from "bun:test";
import { processMyFeature } from "../src/processors/my-processor";

test("应该正确处理特殊标记", async () => {
  const result = await processMyFeature("测试 特殊标记");
  expect(result).toBe("处理后的: 测试 特殊标记");
});
```

## 依赖

- `@ai-dev-kit/core` - 核心类型和工具
- `@linear/sdk` - Linear API 客户端
- `dotenv` - 环境变量加载

## 许可证

MIT
