# Monorepo 架构说明

本文档说明 AI-Dev-Kit 的 Monorepo 架构设计。

## 架构总览

### 项目结构

```
ai-dev-kit/
├── packages/
│   ├── core/                    # @ai-dev-kit/core - 核心类型和工具
│   ├── hooks/                   # @ai-dev-kit/hooks - 处理器实现
│   └── adapters/                # @ai-dev-kit/adapters - 平台适配器
└── .claude/
    ├── hooks/
    │   └── UserPromptSubmit.ts  # Claude Code Hook 入口
    └── prompts/
        └── variations.md        # 变体生成模板
```

## 包说明

### @ai-dev-kit/core

核心类型定义和工具函数。

**主要内容：**
- 处理器类型（`Processor`, `ProcessorConfig`）
- 命令类型（`CommandDefinition`, `CommandRegistry`）
- 环境工具（`getClaudeHome()`, `getClaudeEnvPath()` 等）

**导入示例：**
```typescript
import type { Processor, ProcessorConfig } from '@ai-dev-kit/core';
import { getClaudeHome } from '@ai-dev-kit/core/utils';
```

### @ai-dev-kit/hooks

处理器实现和命令配置。

**主要内容：**
- 3 个处理器：Linear、Command、Variation
- 17+ 个命令：翻译、代码开发、文本处理
- 50+ 个测试用例

**导入示例：**
```typescript
import { processCommand, processLinearReference } from '@ai-dev-kit/hooks/processors';
import { COMMANDS } from '@ai-dev-kit/hooks/commands';
import { getEnabledProcessors } from '@ai-dev-kit/hooks';
```

### @ai-dev-kit/adapters

平台适配器层。

**主要内容：**
- Claude Code 适配器
- Cursor 适配器（预留）

**位置：**
- `packages/adapters/claude/UserPromptSubmit.ts`
- `packages/adapters/cursor/`（待实现）

## 配置说明

### 环境变量

在 `~/.claude/.env` 中配置：

```env
# Linear API Key（可选）
LINEAR_API_KEY=your_api_key_here
```

### 自定义 Claude Home

默认使用 `~/.claude`，可通过环境变量自定义：

```bash
export CLAUDE_HOME=/path/to/custom/claude/home
```

### 处理器配置

在 `packages/hooks/src/config.ts` 中配置：

```typescript
export const AVAILABLE_PROCESSORS: ProcessorConfig[] = [
  { name: 'linear', processor: processLinearReference, enabled: true },
  { name: 'command', processor: processCommand, enabled: true },
  { name: 'variation', processor: processVariation, enabled: true }
];
```

## 测试

### 运行测试

```bash
# 运行所有测试
bun test --recursive

# 运行特定包的测试
cd packages/hooks && bun test

# 或使用脚本
bun run test:hooks
```

### 测试覆盖

- ✅ 50+ 个测试用例
- ✅ 单元测试（每个处理器）
- ✅ 集成测试（处理器链）
- ✅ 边缘情况测试

## 故障排除

### 问题：bun install 卡住

**解决方法：**
```bash
rm -rf node_modules bun.lockb
bun install
```

### 问题：无法找到包 @ai-dev-kit/core

**原因：** 未在 workspace 根目录安装

**解决方法：**
```bash
cd /path/to/ai-dev-kit  # 项目根目录
bun install
```

### 问题：测试失败

**解决方法：**
```bash
# 确保环境变量正确
export CLAUDE_HOME=~/.claude

# 重新运行测试
cd packages/hooks && bun test
```

### 问题：Linear 集成不工作

**检查：**
1. `~/.claude/.env` 文件存在
2. `LINEAR_API_KEY` 正确配置
3. 重启 Claude Code

## 获取帮助

如果遇到问题：

1. 查看 [README.md](./README.md)
2. 查看包文档：
   - [Core 包](./packages/core/README.md)
   - [Hooks 包](./packages/hooks/README.md)
   - [Adapters 包](./packages/adapters/README.md)
3. 提交 Issue 到项目仓库

## 总结

AI-Dev-Kit 采用 Monorepo 架构，具有以下优势：

- ✅ **模块化设计** - Core、Hooks、Adapters 职责清晰
- ✅ **代码复用** - 核心逻辑可在多平台共享
- ✅ **可扩展性** - 易于添加新处理器、命令和平台
- ✅ **类型安全** - 统一的 TypeScript 类型定义
- ✅ **测试完备** - 50+ 测试用例保证质量

更多信息请查看 [README.md](./README.md) 和各包的文档。
