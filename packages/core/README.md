# @ai-dev-kit/core

AI-Dev-Kit 的核心类型定义和工具函数包。

## 功能

### 类型定义

#### Processor

处理器函数类型，接收一个 prompt 字符串并返回处理后的字符串（支持异步）。

```typescript
import type { Processor } from '@ai-dev-kit/core';

const myProcessor: Processor = async (prompt: string): Promise<string> => {
  // 处理逻辑
  return processedPrompt;
};
```

#### ProcessorConfig

处理器配置对象，用于注册和管理处理器。

```typescript
import type { ProcessorConfig } from '@ai-dev-kit/core';

const config: ProcessorConfig = {
  name: 'my-processor',
  processor: myProcessor,
  enabled: true  // 可选，默认为 true
};
```

#### CommandDefinition

命令定义对象，包含命令的前缀和描述。

```typescript
import type { CommandDefinition } from '@ai-dev-kit/core';

const commandDef: CommandDefinition = {
  prefix: '翻译成中文：',
  description: '将内容翻译成中文'
};
```

#### CommandRegistry

命令注册表类型，键为命令标识符，值为命令定义。

```typescript
import type { CommandRegistry } from '@ai-dev-kit/core';

const commands: CommandRegistry = {
  ':zh': {
    prefix: '翻译成中文：',
    description: '翻译成中文'
  },
  ':en': {
    prefix: 'Translate to English: ',
    description: '翻译成英文'
  }
};
```

### 工具函数

#### getClaudeHome()

获取 Claude 配置目录路径。默认为 `~/.claude`，可通过 `CLAUDE_HOME` 环境变量自定义。

```typescript
import { getClaudeHome } from '@ai-dev-kit/core/utils';

const claudeHome = getClaudeHome();
// 返回: /Users/username/.claude 或 process.env.CLAUDE_HOME
```

#### getClaudeEnvPath()

获取 Claude 环境变量文件路径。

```typescript
import { getClaudeEnvPath } from '@ai-dev-kit/core/utils';

const envPath = getClaudeEnvPath();
// 返回: /Users/username/.claude/.env
```

#### getClaudePromptsPath()

获取 Claude prompts 目录路径。

```typescript
import { getClaudePromptsPath } from '@ai-dev-kit/core/utils';

const promptsPath = getClaudePromptsPath();
// 返回: /Users/username/.claude/prompts
```

## 安装

这个包作为 AI-Dev-Kit monorepo 的一部分，通过 workspace 依赖使用：

```json
{
  "dependencies": {
    "@ai-dev-kit/core": "workspace:*"
  }
}
```

## 导出

### 主入口

```typescript
import {
  // 类型
  type Processor,
  type ProcessorConfig,
  type CommandDefinition,
  type CommandRegistry,
  // 工具函数
  getClaudeHome,
  getClaudeEnvPath,
  getClaudePromptsPath
} from '@ai-dev-kit/core';
```

### 子路径导出

```typescript
// 仅导入类型
import type { Processor, ProcessorConfig } from '@ai-dev-kit/core/types';

// 仅导入工具函数
import { getClaudeHome, getClaudeEnvPath } from '@ai-dev-kit/core/utils';
```

## 设计原则

1. **类型优先** - 所有核心类型都在此包定义，确保类型一致性
2. **零依赖** - 除了 TypeScript 和 Bun 类型外，不依赖其他包
3. **平台无关** - 不包含任何平台特定的逻辑
4. **环境可配置** - 通过环境变量支持自定义配置路径

## 许可证

MIT
