# 迁移指南：从单体结构到 Monorepo 架构

本文档说明从旧的单体结构迁移到新的 Monorepo 架构的变化和注意事项。

## 架构变化总览

### 旧结构（v0.x）

```
.claude/
└── hooks/
    ├── UserPromptSubmit.ts
    ├── config/
    │   ├── commands/
    │   └── processors.ts
    └── processors/
        ├── commandProcessor.ts
        ├── linearProcessor.ts
        └── variationProcessor.ts
```

### 新结构（v1.0）

```
ai-dev-kit/
├── packages/
│   ├── core/                    # 核心类型和工具
│   ├── hooks/                   # 处理器实现
│   └── adapters/                # 平台适配器
└── .claude/                     # 向后兼容层
    └── hooks/
        └── UserPromptSubmit.ts  # 从新包重导出
```

## 主要变化

### 1. 包结构变化

#### @ai-dev-kit/core

所有核心类型和工具函数移至此包：

| 旧位置 | 新位置 |
|--------|--------|
| 无独立类型定义 | `packages/core/src/types/` |
| 环境变量使用 `HOME` | `packages/core/src/utils/` 使用 `CLAUDE_HOME` |

#### @ai-dev-kit/hooks

所有处理器和命令配置移至此包：

| 旧位置 | 新位置 |
|--------|--------|
| `.claude/hooks/processors/commandProcessor.ts` | `packages/hooks/src/processors/command.ts` |
| `.claude/hooks/processors/linearProcessor.ts` | `packages/hooks/src/processors/linear.ts` |
| `.claude/hooks/processors/variationProcessor.ts` | `packages/hooks/src/processors/variation.ts` |
| `.claude/hooks/config/commands/*.ts` | `packages/hooks/src/commands/*.ts` |
| `.claude/hooks/config/processors.ts` | `packages/hooks/src/config.ts` |

#### @ai-dev-kit/adapters

新增平台适配器层：

| 功能 | 位置 |
|------|------|
| Claude Code 适配器 | `packages/adapters/claude/UserPromptSubmit.ts` |
| Cursor 适配器（预留） | `packages/adapters/cursor/` |

### 2. 导入路径变化

#### 旧导入方式（仍然有效）

```typescript
import { processCommand } from './.claude/hooks/processors/commandProcessor';
import { COMMANDS } from './.claude/hooks/config/commands';
import { getEnabledProcessors } from './.claude/hooks/config/processors';
```

#### 新导入方式（推荐）

```typescript
import { processCommand } from '@ai-dev-kit/hooks/processors';
import { COMMANDS } from '@ai-dev-kit/hooks/commands';
import { getEnabledProcessors } from '@ai-dev-kit/hooks';
```

#### 类型导入

```typescript
// 旧方式：没有统一的类型定义
type Processor = (prompt: string) => string | Promise<string>;

// 新方式：从 core 包导入
import type { Processor, ProcessorConfig } from '@ai-dev-kit/core';
```

### 3. 配置变化

#### 环境变量

**旧方式：**
- 使用 `HOME` 环境变量
- 硬编码路径 `~/.claude`

**新方式：**
- 使用 `CLAUDE_HOME` 环境变量（可配置）
- 默认为 `~/.claude`，可自定义：

```bash
export CLAUDE_HOME=/path/to/custom/claude/home
```

#### 处理器配置

**旧位置：** `.claude/hooks/config/processors.ts`

**新位置：** `packages/hooks/src/config.ts`

配置方式保持不变：

```typescript
export const AVAILABLE_PROCESSORS: ProcessorConfig[] = [
  { name: 'linear', processor: processLinearReference, enabled: true },
  { name: 'command', processor: processCommand, enabled: true },
  { name: 'variation', processor: processVariation, enabled: true }
];
```

### 4. 测试变化

#### 测试文件位置

| 旧位置 | 新位置 |
|--------|--------|
| `.claude/hooks/processors/*.test.ts` | `packages/hooks/tests/*.test.ts` |

#### 运行测试

**旧方式：**
```bash
cd .claude/hooks
bun test
```

**新方式：**
```bash
# 运行所有测试
bun test --recursive

# 运行特定包的测试
cd packages/hooks && bun test

# 或使用脚本
bun run test:hooks
```

## 向后兼容性

### 完全向后兼容

以下内容**无需修改**：

1. **settings.json** - hook 路径仍然有效：
   ```json
   {
     "hooks": {
       "UserPromptSubmit": "$HOME/.claude/hooks/UserPromptSubmit.ts"
     }
   }
   ```

2. **环境变量文件** - `~/.claude/.env` 仍然在原位置

3. **Prompts 模板** - `~/.claude/prompts/` 仍然在原位置

4. **旧的导入路径** - `.claude/hooks` 中的所有文件都改为重导出，仍然可用

### 包装层实现

`.claude/hooks` 目录现在作为包装层：

```typescript
// .claude/hooks/processors/commandProcessor.ts
/**
 * 向后兼容导出
 * @deprecated 请直接使用 @ai-dev-kit/hooks/processors
 */
export { processCommand } from '@ai-dev-kit/hooks/processors';
```

所有文件都添加了 `@deprecated` 标记，建议使用新导入路径。

## 迁移步骤

### 对于现有用户

**好消息：你不需要做任何事！**

重构完全向后兼容，你的现有配置和代码都会继续工作。

### 对于新开发

建议使用新的导入路径：

1. **使用新包导入：**
   ```typescript
   import { processCommand } from '@ai-dev-kit/hooks/processors';
   import type { Processor } from '@ai-dev-kit/core';
   ```

2. **使用 workspace 安装：**
   ```bash
   cd /path/to/ai-dev-kit
   bun install
   ```

3. **运行测试验证：**
   ```bash
   bun test --recursive
   ```

## 功能增强

### 新增功能

1. **TypeScript 路径映射** - 支持 `@ai-dev-kit/*` 别名
2. **环境变量可配置** - 通过 `CLAUDE_HOME` 自定义配置目录
3. **Monorepo 架构** - 更好的代码组织和复用
4. **平台适配器** - 为支持多平台奠定基础

### 不变的功能

1. **所有命令** - 17+ 个命令保持不变
2. **所有处理器** - Linear、Command、Variation 功能完全一致
3. **测试覆盖** - 50+ 个测试用例全部保留
4. **使用体验** - 用户使用方式完全一致

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

## 未来计划

### v1.1（计划中）

- [ ] Cursor 适配器
- [ ] CLI 工具
- [ ] 更多命令

### v1.2（计划中）

- [ ] Skills 包
- [ ] Subagents 包

### v2.0（计划中）

- [ ] NPM 发布
- [ ] 插件系统
- [ ] Web 界面

## 获取帮助

如果遇到问题：

1. 查看 [README.md](./README.md)
2. 查看包文档：
   - [Core 包](./packages/core/README.md)
   - [Hooks 包](./packages/hooks/README.md)
   - [Adapters 包](./packages/adapters/README.md)
3. 提交 Issue 到项目仓库

## 总结

这次重构的目标是：

- ✅ **零破坏** - 现有用户无需任何修改
- ✅ **更好的架构** - Monorepo 支持更好的代码复用
- ✅ **可扩展性** - 为支持多平台和新功能奠定基础
- ✅ **开发体验** - 更清晰的代码组织和类型定义

所有测试通过，功能保持一致，你可以放心使用！
