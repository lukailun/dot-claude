/**
 * Claude Code Adapter Generator
 * 生成 Claude Code 特定的 hook 和配置文件
 */

import { IDEAdapter, AdapterConfig, InstallResult } from "../shared";
import { getClaudeHome } from "@ai-dev-kit/core/utils";
import { join, dirname } from "path";
import { mkdir, writeFile, cp, readFile } from "fs/promises";
import { existsSync, readdirSync, statSync } from "fs";

/**
 * 修复文件中的导入路径
 */
async function fixImports(dir: string): Promise<void> {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      await fixImports(filePath);
    } else if (file.endsWith('.ts')) {
      let content = await readFile(filePath, 'utf-8');

      // 替换导入路径
      content = content
        .replace(/from ['\"]@ai-dev-kit\/core\/utils['\"]/g, 'from "../utils/index.ts"')
        .replace(/from ['\"]@ai-dev-kit\/core\/types['\"]/g, 'from "../types/index.ts"')
        .replace(/from ['\"]@ai-dev-kit\/core['\"]/g, 'from "../types/index.ts"')
        .replace(/from ['\"]@ai-dev-kit\/hooks\/processors['\"]/g, 'from "../processors/index.ts"')
        .replace(/from ['\"]@ai-dev-kit\/hooks\/commands['\"]/g, 'from "../commands/index.ts"')
        .replace(/from ['\"]@ai-dev-kit\/hooks['\"]/g, 'from "./config.ts"');

      await writeFile(filePath, content, 'utf-8');
    }
  }
}

export class ClaudeAdapter extends IDEAdapter {
  getInstallPath(): string {
    return this.config.targetDir || join(getClaudeHome(), 'hooks');
  }

  generateHook(): string {
    return `/**
 * AI-Dev-Kit UserPromptSubmit Hook for Claude Code
 * Auto-generated - Do not edit manually
 */
import { type UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk";
import { getEnabledProcessors } from "./config.ts";

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
`;
  }

  generatePackageJson(): string {
    const packageJson = {
      name: "claude-hooks",
      type: "module",
      private: true,
      dependencies: {
        "@linear/sdk": "^68.0.0",
        "@anthropic-ai/claude-agent-sdk": "^0.1.75"
      }
    };

    return JSON.stringify(packageJson, null, 2);
  }

  async install(): Promise<InstallResult> {
    const claudeHome = getClaudeHome();
    const hooksDir = this.getInstallPath();
    const filesCreated: string[] = [];

    try {
      // 获取项目根目录
      const adapterFile = import.meta.url.replace('file://', '');
      const adapterDir = dirname(adapterFile); // packages/adapters/claude
      const adaptersDir = dirname(adapterDir); // packages/adapters
      const packagesDir = dirname(adaptersDir); // packages
      const projectRoot = dirname(packagesDir); // project root

      const hooksSrc = join(projectRoot, 'packages/hooks/src');
      const coreSrc = join(projectRoot, 'packages/core/src');
      const templatesSrc = join(projectRoot, 'templates/claude');

      console.log('\\n🚀 安装 AI-Dev-Kit 到 Claude Code...\\n');

      // 1. 创建目录结构
      await mkdir(hooksDir, { recursive: true });
      await mkdir(join(hooksDir, 'processors'), { recursive: true });
      await mkdir(join(hooksDir, 'commands'), { recursive: true });
      await mkdir(join(hooksDir, 'utils'), { recursive: true });
      await mkdir(join(hooksDir, 'types'), { recursive: true });
      console.log(`✓ 创建目录结构`);

      // 2. 复制源文件
      console.log('\\n📋 复制源文件...');

      // 复制 processors
      await cp(join(hooksSrc, 'processors'), join(hooksDir, 'processors'), { recursive: true });
      filesCreated.push('processors/');
      console.log(`✓ 复制 processors`);

      // 复制 commands
      await cp(join(hooksSrc, 'commands'), join(hooksDir, 'commands'), { recursive: true });
      filesCreated.push('commands/');
      console.log(`✓ 复制 commands`);

      // 复制 config.ts
      await cp(join(hooksSrc, 'config.ts'), join(hooksDir, 'config.ts'));
      filesCreated.push('config.ts');
      console.log(`✓ 复制 config.ts`);

      // 复制 utils (从 core)
      await cp(join(coreSrc, 'utils'), join(hooksDir, 'utils'), { recursive: true });
      filesCreated.push('utils/');
      console.log(`✓ 复制 utils`);

      // 复制 types (从 core)
      await cp(join(coreSrc, 'types'), join(hooksDir, 'types'), { recursive: true });
      filesCreated.push('types/');
      console.log(`✓ 复制 types`);

      // 2.5. 修复导入路径
      console.log('\\n🔧 修复导入路径...');
      await fixImports(hooksDir);
      console.log(`✓ 导入路径已修复`);

      // 3. 生成 package.json（在 claudeHome 根目录）
      await writeFile(
        join(claudeHome, 'package.json'),
        this.generatePackageJson(),
        'utf-8'
      );
      filesCreated.push('package.json');
      console.log(`✓ 生成 package.json`);

      // 4. 生成 UserPromptSubmit.ts
      await writeFile(
        join(hooksDir, 'UserPromptSubmit.ts'),
        this.generateHook(),
        'utf-8'
      );
      filesCreated.push('UserPromptSubmit.ts');
      console.log(`✓ 生成 UserPromptSubmit.ts`);

      // 5. 复制 commands 和 prompts 从 templates
      const commandsDir = join(claudeHome, 'commands');
      await mkdir(commandsDir, { recursive: true });
      await cp(join(templatesSrc, 'commands'), commandsDir, { recursive: true });
      filesCreated.push('../commands/');
      console.log(`✓ 复制 slash commands`);

      const promptsDir = join(claudeHome, 'prompts');
      await mkdir(promptsDir, { recursive: true });
      await cp(join(templatesSrc, 'prompts'), promptsDir, { recursive: true });
      filesCreated.push('../prompts/');
      console.log(`✓ 复制 prompts`);

      // 6. 复制 .env 模板
      const envPath = join(claudeHome, '.env');
      if (!existsSync(envPath)) {
        await cp(join(templatesSrc, '.env.template'), envPath);
        filesCreated.push('../.env');
        console.log(`✓ 复制 .env`);
      } else {
        console.log(`✓ .env 已存在`);
      }

      console.log('\\n✅ 文件安装完成！\\n');

      return {
        success: true,
        targetDir: hooksDir,
        filesCreated,
        message: this.getSuccessMessage(hooksDir, envPath),
      };

    } catch (error) {
      return {
        success: false,
        targetDir: hooksDir,
        filesCreated,
        message: `安装失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async installDependencies(targetDir: string): Promise<void> {
    const { spawn } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(spawn);

    console.log('\\n📦 安装依赖...');
    await execAsync('bun', ['install'], { cwd: targetDir });
    console.log('✓ 依赖安装完成');
  }

  private getSuccessMessage(hooksDir: string, envPath: string): string {
    const claudeHome = getClaudeHome();
    return `下一步:
  1. 安装依赖:
     cd ${claudeHome}
     bun install

  2. 配置 settings.json:
     在 ${join(claudeHome, 'settings.json')} 中添加：
     {
       "hooks": {
         "UserPromptSubmit": "${join(hooksDir, 'UserPromptSubmit.ts')}"
       }
     }

  3. （可选）配置 Linear API Key:
     编辑 ${envPath}

  4. 重启 Claude Code`;
  }
}
