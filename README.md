# dot-claude

这是一个 Claude Code 的 UserPromptSubmit hook，用于增强提示词功能，支持命令快捷方式、Linear 集成和多方案生成。

## 快速开始

### 前置要求

本项目使用 [Bun](https://bun.sh) 作为运行时和包管理器。

### 安装步骤

1. **移动项目到 `~/.claude`**

   将本项目的 `commands`、`hooks`、`prompts` 这三个目录，以及 `.env.template` 文件移动或复制到 `~/.claude` 目录下。

   > **提示**: 如果你的 `~/.claude` 目录中已有同名目录和文件，建议手动合并以避免覆盖现有配置。

	移动完成后，`~/.claude` 目录结构如下：

	```
	~/.claude/
	├── .env.template
	├── hooks/
	├── commands/
	└── prompts/
```

2. **配置环境变量**

   将 `~/.claude/.env.template` 重命名为 `~/.claude/.env`，然后编辑该文件，填入你的 Linear API Key：

   ```
   LINEAR_API_KEY=your_linear_api_key_here
   ```

   > **提示**: 如果你不使用 Linear 集成功能，可以跳过此步骤或留空该值。
   
   	> [Linear Personal API Keys](https://linear.app/developers/graphql#personal-api-keys)

3. **安装 Bun**

	如果你还没有安装 Bun，请运行以下命令：

	```bash
	curl -fsSL https://bun.sh/install | bash
	```

4. **安装项目依赖**

   在 `~/.claude/hooks` 目录中安装依赖：

   ```bash
   cd ~/.claude/hooks
   bun install
   ```

5. **配置 Claude Code Settings**

   编辑 `~/.claude/settings.json` 文件，添加以下 hooks 配置：

   ```json
   {
     "hooks": {
       "UserPromptSubmit": [{
         "hooks": [{
           "type": "command",
           "command": "bun run $HOME/.claude/hooks/UserPromptSubmit.ts"
         }]
       }]
     }
   }
   ```

   > **提示**: 如果你的 `settings.json` 中已有其他配置，请将 `hooks` 部分合并到现有配置中。

6. **开始使用**

   配置完成后，该 hook 会在你使用 Claude Code 提交提示词时自动运行。

## 功能特性

### 1. 命令快捷方式

使用简短的命令后缀快速添加指令前缀，无需每次输入完整的提示词。

**使用方法**:

* Hook 方式：`任务内容 :command` （例如：`Hello World :zh`）
* Slash Command 方式：`/command 任务内容` （例如：`/zh Hello World`）

**可用命令**:

| 命令 | 说明 | Hook 方式示例 | Slash Command 方式示例 |
|------|------|---------|---------|
| `zh` | 翻译为中文 | `Hello World :zh` | `/zh Hello World` |
| `en` | 翻译为英文 | `你好世界 :en` | `/en 你好世界` |
| `plan` | 生成分步计划 | `实现用户登录功能 :plan` | `/plan 实现用户登录功能` |
| `explain` | 通俗易懂解释 | `什么是闭包 :explain` | `/explain 什么是闭包` |
| `summarize` | 总结内容 | `@article.md :summarize` | `/summarize @article.md` |
| `analyze` | 分析问题 | `系统性能下降 :analyze` | `/analyze 系统性能下降` |
| `improve` | 文本润色 | `优化这段文案 :improve` | `/improve 优化这段文案` |
| `code` | 代码编写 | `快速排序算法 :code` | `/code 快速排序算法` |
| `comment` | 添加注释 | `@utils.ts :comment` | `/comment @utils.ts` |
| `debug` | 调试分析 | `函数返回 undefined :debug` | `/debug 函数返回 undefined` |
| `refactor` | 代码重构 | `@legacy.js :refactor` | `/refactor @legacy.js` |
| `test` | 生成测试用例 | `@auth.ts :test` | `/test @auth.ts` |
| `document` | 生成技术文档 | `@api.ts :document` | `/document @api.ts` |
| `review` | 代码审查 | `@component.tsx :review` | `/review @component.tsx` |

### 2. Linear 集成

快速引用 Linear issue 数据，自动获取完整的 issue 信息。

**使用方法**:

支持两种格式：

* 完整格式：`linear(4t-1111)`
* 简写格式：`4t(1111)`

**示例**:

```
修复 linear(4t-1111) 中描述的 bug
```

```
优化 4t(1111) 的性能问题
```

会自动将 `linear(4t-1111)` 和 `4t(1111)` 替换为对应 issue 的完整 JSON 数据，包括标题、描述、状态等信息。

> **提示**: 需要在 `~/.claude/.env` 中设置 `LINEAR_API_KEY`。

> [Linear Personal API Keys](https://linear.app/developers/graphql#personal-api-keys)

### 3. 多方案生成

生成多个不同的解决方案，用于探索不同的实现思路。

**使用方法**: `任务描述 v(数量)`

**示例**:
```
实现用户认证 v(3)
```

会生成 3 个不同的用户认证实现方案。

## 组合使用

以上功能可以组合使用：

**示例**:

```
4t(1111):debug          # Linear 引用 + 调试分析
```

**处理顺序**:

1. **Linear 引用处理** - 替换 `linear(issueId)` 或 `4t(1111)` 为实际数据
2. **命令处理** - 识别并展开 `:command` 命令快捷方式
3. **多方案处理** - 处理 `v(n)` 生成多个方案

