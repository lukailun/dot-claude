# AI-Dev-Kit

一个支持多 AI IDE 平台的开发工具包，提供统一的 prompt 处理和工作流增强功能。

## 项目简介

AI-Dev-Kit 是一个 Monorepo 架构的项目，旨在为 Claude Code、Cursor 等 AI IDE 提供可复用的 hook、processor 和工具函数。通过模块化设计，您可以轻松地扩展功能、添加新的处理器，并在不同平台间共享核心逻辑。

## 前置要求

本项目使用 [Bun](https://bun.sh) 作为运行时和包管理器。

如果你还没有安装 Bun，请运行以下命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

## 架构设计

```
ai-dev-kit/
├── packages/
│   ├── core/                    # @ai-dev-kit/core - 核心类型和工具
│   │   └── src/
│   │       ├── types/          # 处理器类型、命令类型等
│   │       └── utils/          # 环境变量工具、路径工具等
│   ├── hooks/                   # @ai-dev-kit/hooks - 处理器实现
│   │   ├── src/
│   │   │   ├── processors/     # Linear、Command、Variation 处理器
│   │   │   ├── commands/       # 命令配置（翻译、代码、文本处理）
│   │   │   └── config.ts       # 处理器配置管理
│   │   └── tests/              # 50+ 测试用例
│   └── adapters/                # @ai-dev-kit/adapters - 平台适配层
│       ├── claude/              # Claude Code 适配器
│       └── cursor/              # Cursor 适配器（预留）
├── .claude/                     # 向后兼容层
│   ├── hooks/
│   │   └── UserPromptSubmit.ts  # 包装层入口（从新包重导出）
│   └── prompts/
│       └── variations.md        # 多种方案模板
└── README.md                    # 本文件
```

### 包依赖关系

```
@ai-dev-kit/adapters → @ai-dev-kit/hooks → @ai-dev-kit/core
```

## 核心功能

### 🎯 UserPromptSubmit Hook

自动处理用户输入的提示词，通过可配置的 processors 提供智能增强功能。

### 🔧 Processors

项目包含三个主要 processors，按顺序执行：

#### 1. **Linear Processor**
集成 Linear issue 管理系统

```bash
# 使用方式
linear(TEAM-123)
```

功能：
- 自动获取 Linear issue 的详细信息
- 无需手动复制粘贴 issue 内容
- 需要配置 `LINEAR_API_KEY`

#### 2. **Command Processor**
命令快捷方式，在提示词末尾使用 `:command` 格式

```bash
# 示例
翻译这段文字 :zh
实现排序算法 :code
解释量子计算 :explain
```

支持的命令：

**文本处理类**
- `:analyze` - 分析（指出核心问题和解决方向）
- `:explain` - 通俗解释
- `:improve` - 文本润色
- `:plan` - 生成分步计划
- `:summarize` - 总结

**翻译类**
- `:en` - 翻译为英文
- `:zh` - 翻译为中文

**代码开发类**
- `:code` - 代码编写
- `:comment` - 代码注释
- `:debug` - 调试分析
- `:document` - 技术文档生成
- `:refactor` - 代码重构
- `:review` - 代码审查
- `:test` - 测试用例生成

#### 3. **Variation Processor**
生成多种不同的解决方案

```bash
# 使用方式
实现身份验证系统 v(3)  # 生成 3 种不同的方案
优化数据库查询 v(5)    # 生成 5 种不同的方案
```

### 🔄 组合使用

Processors 可以组合使用，按顺序执行：

```bash
# Command + Variation
设计 API 架构 v(3) :plan
# 输出：生成 3 个不同的详细分步计划

# 只用 Command
重构这段代码 :refactor
# 输出：重构建议

# 只用 Variation
数据库设计方案 v(4)
# 输出：4 个不同的数据库设计方案
```

## 快速开始

### 1. 安装依赖

```bash
# 在项目根目录安装所有依赖
bun install
```

### 2. 配置环境变量（可选）

如果需要使用 Linear 集成功能，在 `~/.claude/.env` 中配置：

```bash
# LINEAR API Key
LINEAR_API_KEY=your_linear_api_key_here
```

### 3. 开始使用

Hook 会自动处理所有输入的提示词：

```bash
# 翻译
Hello World :zh

# 代码生成
实现二分查找算法 :code

# 生成多个方案
设计用户认证系统 v(3)

# 组合使用
优化数据库查询 v(2) :analyze

# Linear 集成
修复 LINEAR-123 中的问题
```

## 开发指南

### 添加新命令

在 `packages/hooks/src/commands/` 目录下的相应文件中添加：

```typescript
// 例如在 text-processing.ts 中添加
export const TEXT_PROCESSING: CommandRegistry = {
  ':custom': {
    prefix: '你的自定义前缀：',
    description: '自定义命令描述'
  },
  // ... 其他命令
};
```

然后在 `packages/hooks/src/commands/index.ts` 中导出。

### 添加新 Processor

1. 在 `packages/hooks/src/processors/` 创建新文件：

```typescript
import type { Processor } from '@ai-dev-kit/core';

export const processYourFeature: Processor = async (prompt: string): Promise<string> => {
  // 你的处理逻辑
  return processedPrompt;
};
```

2. 在 `packages/hooks/src/config.ts` 注册：

```typescript
export const AVAILABLE_PROCESSORS: ProcessorConfig[] = [
  {
    name: 'your-feature',
    processor: processYourFeature,
    enabled: true
  },
  // ... 其他处理器
];
```

3. 编写测试（在 `packages/hooks/tests/`）

### 处理器执行顺序

处理器按照 `AVAILABLE_PROCESSORS` 数组的顺序依次执行：

1. **Linear Processor** - 处理 Linear Issue 引用
2. **Command Processor** - 处理命令后缀
3. **Variation Processor** - 处理变体生成

每个处理器的输出作为下一个处理器的输入。

## 测试

### 运行所有测试

```bash
bun test --recursive
```

### 运行特定包的测试

```bash
# 测试 Hooks 包
bun run test:hooks

# 或直接进入目录
cd packages/hooks && bun test
```

### 测试覆盖

项目包含 50+ 个测试用例，覆盖：
- 单元测试 - 每个处理器的独立功能
- 集成测试 - 处理器链条的组合功能
- 边缘情况 - 异常输入、空值处理等

## 项目架构

```
UserPromptSubmit Hook
        ↓
  获取启用的 Processors
        ↓
    按顺序执行：
    1. Linear Processor
    2. Command Processor
    3. Variation Processor
        ↓
    输出处理后的提示词
```

## 向后兼容

`.claude/hooks` 目录保持为向后兼容层，所有文件都已改为从新包重导出。这意味着：

- ✅ 现有的 `settings.json` 配置无需修改
- ✅ 旧的导入路径仍然可用
- ✅ 所有测试在新旧位置都通过

如果您想直接使用新包，可以修改导入：

```typescript
// 旧方式（仍然有效）
import { processCommand } from './.claude/hooks/processors/commandProcessor';

// 新方式（推荐）
import { processCommand } from '@ai-dev-kit/hooks/processors';
```

## 路线图

- [x] 基础 Monorepo 架构
- [x] 核心处理器（Linear、Command、Variation）
- [x] Claude Code 适配器
- [ ] Cursor 适配器
- [ ] CLI 工具
- [ ] Skills 包
- [ ] Subagents 包
- [ ] NPM 发布

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循现有代码风格
- 为新功能添加测试
- 确保所有测试通过 (`bun test --recursive`)

## 许可证

MIT

## 相关链接

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- [Linear API 文档](https://developers.linear.app)
- [Bun 官方文档](https://bun.sh/docs)
