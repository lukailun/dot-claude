# AI-Dev-Kit 开发环境

这是 AI-Dev-Kit 项目的**开发和测试环境**。

## 目录说明

此目录配置为项目开发者的 Claude Code 环境，用于：
- 测试新功能
- 调试处理器
- 验证改动

**注意**: 此目录**不是**安装模板的来源。用户安装使用的模板位于 `../templates/` 目录。

## 目录结构

```
claude-code/
├── hooks/
│   ├── UserPromptSubmit.ts   # Hook 入口（使用 workspace 依赖）
│   └── package.json           # 依赖配置
├── settings.json              # Claude Code 配置
└── README.md                  # 本文件
```

## 与用户安装的区别

| 项目 | 开发环境 (claude-code) | 用户环境 (~/.claude) |
|------|-------------------|---------------------|
| 依赖方式 | workspace:* 依赖 | 复制的源代码文件 |
| commands/ | 从 templates/ 链接 | 从 templates/ 复制 |
| prompts/ | 从 templates/ 链接 | 从 templates/ 复制 |
| 更新方式 | git pull | 重新运行 install |

## 如何使用

1. **设置开发环境**
   ```bash
   cd claude-code/hooks
   bun install
   ```

2. **测试处理器**
   ```bash
   echo '{"prompt": "Hello :zh"}' | bun run UserPromptSubmit.ts
   ```

3. **在 Claude Code 中测试**
   - 确保 settings.json 中配置了正确的 hook 路径
   - 重启 Claude Code
   - 输入测试指令

## 相关目录

- `../templates/` - 用户安装模板
- `../packages/hooks/` - 处理器源代码
- `../packages/adapters/` - 平台适配器
