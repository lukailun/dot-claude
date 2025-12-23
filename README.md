# AI-Dev-Kit

一个支持多 AI IDE 平台的开发工具包，提供统一的 prompt 处理和工作流增强功能。

## 项目简介

AI-Dev-Kit 是一个 Monorepo 架构的项目，旨在为 Claude Code、Cursor 等 AI IDE 提供可复用的 hook、processor 和工具函数。通过模块化设计和适配器模式，您可以轻松地扩展功能、添加新的处理器，并在不同平台间共享核心逻辑。

**核心特性**：
- 🎯 **跨 IDE 支持** - 一次开发，多平台运行（Claude Code、Cursor）
- 🔧 **智能处理器** - Linear 集成、命令快捷方式、多方案生成
- 📦 **适配器模式** - 轻松添加新 IDE 支持
- 🚀 **一键安装** - 自动安装到所有支持的 IDE

## 前置要求

本项目使用 [Bun](https://bun.sh) 作为运行时和包管理器。

如果你还没有安装 Bun，请运行以下命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

## 快速开始

### 1. 克隆并安装

```bash
# 克隆项目
git clone https://github.com/your-org/ai-dev-kit.git
cd ai-dev-kit

# 安装依赖
bun install
```

### 2. 安装到 IDE

```bash
# 安装到 Claude Code 和 Cursor
bun cli install

# 或指定特定 IDE
bun cli install --target=claude
bun cli install --target=cursor  # 待实现

# 强制覆盖已有安装
bun cli install --force
```

安装后会自动：
- 复制处理器代码到 `~/.claude/hooks/`
- 复制 slash commands 到 `~/.claude/commands/`
- 复制 prompts 模板到 `~/.claude/prompts/`
- 生成配置文件

### 3. 完成配置

```bash
# 1. 安装依赖（在 ~/.claude/ 根目录）
cd ~/.claude
bun install

# 2. 配置 settings.json
# 在 ~/.claude/settings.json 中添加：
{
  "hooks": {
    "UserPromptSubmit": "~/.claude/hooks/UserPromptSubmit.ts"
  }
}

# 3. （可选）配置 Linear API Key
# 编辑 ~/.claude/.env
LINEAR_API_KEY=your_linear_api_key_here

# 4. 重启 Claude Code
```

### 4. 开始使用

在 Claude Code 中直接使用：

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
linear(TEAM-123)
```

## 架构设计

### 项目结构

```
ai-dev-kit/
├── packages/                      # Monorepo 包
│   ├── core/                      # 核心类型和工具
│   │   └── src/
│   │       ├── types/            # Processor、Command 类型定义
│   │       └── utils/            # 环境变量、路径工具
│   │
│   ├── hooks/                     # 处理器实现
│   │   ├── src/
│   │   │   ├── processors/       # Linear、Command、Variation
│   │   │   ├── commands/         # 命令定义（15+个命令）
│   │   │   └── config.ts         # 处理器配置
│   │   └── tests/                # 50+ 测试用例
│   │
│   ├── adapters/                  # 平台适配器 ⭐
│   │   ├── shared/               # IDEAdapter 基类
│   │   ├── claude/               # Claude Code 适配器
│   │   ├── cursor/               # Cursor 适配器（预留）
│   │   └── src/                  # 工厂函数
│   │
│   └── cli/                       # CLI 工具
│       └── src/commands/
│           └── install.ts        # 跨 IDE 安装命令
│
├── templates/                     # 安装模板 ⭐
│   ├── claude/                   # Claude Code 模板
│   │   ├── commands/             # Slash commands
│   │   ├── prompts/              # Prompt 模板
│   │   ├── .env.template         # 环境变量模板
│   │   └── package.template.json
│   └── cursor/                   # Cursor 模板（预留）
│
└── claude-code/                   # 开发环境 ⭐
    ├── hooks/                    # 使用 workspace 依赖
    ├── commands@ -> templates/   # 符号链接
    └── prompts@ -> templates/    # 符号链接
```

### 包依赖关系

```
cli → adapters → hooks → core
```

### 适配器模式

```typescript
// 创建适配器
const adapter = createAdapter('claude', { force: true });

// 执行安装
const result = await adapter.install();

// 支持的 IDE
getSupportedIDEs();     // ['claude', 'cursor']
getImplementedIDEs();   // ['claude'] - 当前已实现
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

# Linear + Command
linear(TEAM-123) :analyze
# 输出：获取 issue 详情并分析问题

# 全部组合
linear(TEAM-456) v(2) :code
# 输出：基于 issue 生成 2 种实现方案
```

## CLI 工具

### 安装命令

```bash
# 安装到所有 IDE
bun cli install
# 输出：
# 🚀 安装 AI-Dev-Kit 到所有支持的 IDE (claude)...
# ============================================================
# 正在安装到 CLAUDE...
# ============================================================
# ✓ 创建目录结构
# ✓ 复制源文件...
# ...
# ✅ 文件安装完成！

# 只安装到 Claude Code
bun cli install --target=claude

# 只安装到 Cursor
bun cli install --target=cursor  # 待实现

# 强制覆盖
bun cli install --force
```

### 测试处理器

```bash
# 测试翻译
bun cli process "Hello World :zh"

# 测试代码生成
bun cli process "Sort array :code"

# 测试变体生成
bun cli process "Design API v(3)"

# 测试 Linear 集成
bun cli process "linear(TEAM-123)"
```

### 管理命令

```bash
# 查看所有命令
bun cli commands list

# 查看所有处理器
bun cli processors list

# 启用/禁用处理器
bun cli processors enable linear
bun cli processors disable variation

# 初始化配置
bun cli init

# 查看版本
bun cli version

# 查看帮助
bun cli help
```

## 开发指南

### 项目角色说明

**开发环境** (`claude-code/`)：
- 项目开发者的测试环境
- 使用 `workspace:*` 依赖，直接引用源代码
- 通过符号链接使用 templates 中的配置

**用户环境** (`~/.claude/`)：
- 用户安装后的运行环境
- 包含完整的处理器源代码副本
- 独立的依赖安装

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

### 添加新 IDE 支持

1. 创建适配器：

```typescript
// packages/adapters/your-ide/adapter.ts
import { IDEAdapter, AdapterConfig, InstallResult } from "../shared";

export class YourIDEAdapter extends IDEAdapter {
  getInstallPath(): string {
    return join(homedir(), '.your-ide/hooks');
  }

  generateHook(): string {
    // 生成 IDE 特定的 hook 代码
  }

  generatePackageJson(): string {
    // 生成 package.json
  }

  async install(): Promise<InstallResult> {
    // 执行安装逻辑
  }
}
```

2. 在工厂函数中注册：

```typescript
// packages/adapters/src/index.ts
import { YourIDEAdapter } from '../your-ide';

export function createAdapter(target: TargetIDE, config: AdapterConfig = {}): IDEAdapter {
  switch (target) {
    case 'claude':
      return new ClaudeAdapter(config);
    case 'your-ide':
      return new YourIDEAdapter(config);
    // ...
  }
}

export function getImplementedIDEs(): TargetIDE[] {
  return ['claude', 'your-ide']; // 添加到列表
}
```

3. 创建模板：

```
templates/your-ide/
├── config.template
└── ...
```

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

## 项目架构流程

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

## 路线图

- [x] 基础 Monorepo 架构
- [x] 核心处理器（Linear、Command、Variation）
- [x] Claude Code 适配器
- [x] CLI 工具
- [x] 适配器模式重构
- [x] 跨 IDE 安装支持
- [ ] Cursor 适配器
- [ ] Windsurf 适配器
- [ ] Skills 包
- [ ] Subagents 包
- [ ] NPM 发布

## 常见问题

### Q: 如何更新已安装的 AI-Dev-Kit？

```bash
# 在项目目录
git pull
bun install

# 重新安装到 IDE（会覆盖）
bun cli install --force
```

### Q: 支持哪些 IDE？

当前已实现：
- ✅ Claude Code

计划支持：
- ⏳ Cursor
- ⏳ Windsurf
- ⏳ Zed

### Q: 如何禁用某个 processor？

```bash
# 使用 CLI
bun cli processors disable variation

# 或手动编辑 ~/.claude/hooks/config.ts
```

### Q: Linear Processor 不工作？

确保：
1. 配置了 `LINEAR_API_KEY` 在 `~/.claude/.env`
2. API Key 有正确的权限
3. Issue ID 格式正确（如 `TEAM-123`）

### Q: 开发环境 (claude-code/) 和用户环境 (~/.claude/) 有什么区别？

| 项目 | 开发环境 (claude-code) | 用户环境 (~/.claude) |
|------|-------------------|---------------------|
| 用途 | 开发和测试 | 生产使用 |
| 依赖方式 | workspace:* | 复制的源代码 |
| 更新方式 | git pull | 重新 install |
| 文件来源 | 直接使用源码 | install 命令复制 |

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
- 更新相关文档

## 许可证

MIT

## 相关链接

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- [Linear API 文档](https://developers.linear.app)
- [Bun 官方文档](https://bun.sh/docs)

## 致谢

感谢所有贡献者和使用者！

---

Made with ❤️ using [Bun](https://bun.sh)
