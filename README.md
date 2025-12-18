# Claude Code Hooks

这是一个增强 Claude Code 用户体验的 hooks 项目，通过 UserPromptSubmit Hook 提供智能提示词处理功能。

## 前置要求

本项目使用 [Bun](https://bun.sh) 作为运行时和包管理器。

如果你还没有安装 Bun，请运行以下命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

## 目录结构

```
.claude/
├── hooks/
│   ├── UserPromptSubmit.ts           # 主 Hook 入口
│   ├── config/
│   │   ├── commands/                 # 命令配置
│   │   │   ├── index.ts              # 命令汇总
│   │   │   ├── code-development.ts   # 代码开发类命令
│   │   │   ├── text-processing.ts    # 文本处理类命令
│   │   │   └── translation.ts        # 翻译类命令
│   │   └── processors.ts             # Processor 配置
│   └── processors/
│       ├── commandProcessor.ts       # 命令处理器
│       ├── linearProcessor.ts        # Linear 集成处理器
│       ├── variationProcessor.ts     # 变体生成处理器
│       └── *.test.ts                 # 测试文件
├── prompts/
│   └── variations.md                 # 多种方案模板
├── .env.template                     # 环境变量模板
└── README.md                         # 本文件
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
cd .claude/hooks
bun install
```

### 2. 配置环境变量（可选）

如果需要使用 Linear 集成功能：

```bash
cp .env.template .env
# 编辑 .env 文件，填入你的 LINEAR_API_KEY
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
修复 linear(TEAM-123) 中的问题
```

## 自定义配置

### 启用/禁用 Processors

编辑 `.claude/hooks/config/processors.ts` 文件：

```typescript
export const AVAILABLE_PROCESSORS: ProcessorConfig[] = [
  {
    name: 'linear',
    processor: processLinearReference,
    enabled: true  // 设置为 false 禁用
  },
  {
    name: 'command',
    processor: processCommand,
    enabled: true
  },
  {
    name: 'variation',
    processor: processVariation,
    enabled: true
  }
];
```

### 添加新命令

在 `.claude/hooks/config/commands/` 目录下的对应文件中添加：

```typescript
// 例如在 text-processing.ts 中添加
export const TEXT_PROCESSING = {
  ':custom': {
    prefix: '你的自定义前缀：',
    description: '自定义命令描述'
  },
  // ... 其他命令
};
```

### 添加新 Processor

1. 在 `.claude/hooks/processors/` 创建新的 processor 文件
2. 在 `.claude/hooks/config/processors.ts` 注册新 processor
3. 编写测试文件

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

## 许可证

MIT

## 相关链接

- [Claude Code 官方文档](https://docs.claude.ai/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- [Linear API 文档](https://developers.linear.app)
- [Bun 官方文档](https://bun.sh/docs)
