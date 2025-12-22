import { getClaudeHome } from "@ai-dev-kit/core/utils";
import { existsSync, readdirSync, statSync } from "fs";
import { mkdir, writeFile, cp, readFile } from "fs/promises";
import { join, dirname } from "path";

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
        .replace(/from ['"]@ai-dev-kit\/core\/utils['"]/g, 'from "../utils/index.ts"')
        .replace(/from ['"]@ai-dev-kit\/core\/types['"]/g, 'from "../types/index.ts"')
        .replace(/from ['"]@ai-dev-kit\/core['"]/g, 'from "../types/index.ts"')
        .replace(/from ['"]@ai-dev-kit\/hooks\/processors['"]/g, 'from "../processors/index.ts"')
        .replace(/from ['"]@ai-dev-kit\/hooks\/commands['"]/g, 'from "../commands/index.ts"')
        .replace(/from ['"]@ai-dev-kit\/hooks['"]/g, 'from "./config.ts"');

      await writeFile(filePath, content, 'utf-8');
    }
  }
}

/**
 * 安装 AI-Dev-Kit 到用户的 Claude Code 环境
 */
export async function installCommand(): Promise<void> {
  console.log('\n🚀 安装 AI-Dev-Kit 到 Claude Code...\n');

  const claudeHome = getClaudeHome();
  const hooksDir = join(claudeHome, 'hooks');

  // 获取源代码目录（packages/hooks/src）
  const cliFile = import.meta.url.replace('file://', '');
  const cliCommandsDir = dirname(cliFile);  // packages/cli/src/commands
  const cliSrcDir = dirname(cliCommandsDir); // packages/cli/src
  const cliDir = dirname(cliSrcDir);         // packages/cli
  const packagesDir = dirname(cliDir);       // packages
  const projectRoot = dirname(packagesDir);  // project root

  const hooksSrc = join(projectRoot, 'packages/hooks/src');
  const coreSrc = join(projectRoot, 'packages/core/src');

  try {
    // 1. 创建目录结构
    await mkdir(hooksDir, { recursive: true });
    await mkdir(join(hooksDir, 'processors'), { recursive: true });
    await mkdir(join(hooksDir, 'commands'), { recursive: true });
    await mkdir(join(hooksDir, 'utils'), { recursive: true });
    console.log(`✓ 创建目录结构`);

    // 2. 复制源文件
    console.log('\n📋 复制源文件...');

    // 复制 processors
    await cp(join(hooksSrc, 'processors'), join(hooksDir, 'processors'), { recursive: true });
    console.log(`✓ 复制 processors`);

    // 复制 commands
    await cp(join(hooksSrc, 'commands'), join(hooksDir, 'commands'), { recursive: true });
    console.log(`✓ 复制 commands`);

    // 复制 config.ts
    await cp(join(hooksSrc, 'config.ts'), join(hooksDir, 'config.ts'));
    console.log(`✓ 复制 config.ts`);

    // 复制 utils (从 core)
    await cp(join(coreSrc, 'utils'), join(hooksDir, 'utils'), { recursive: true });
    console.log(`✓ 复制 utils`);

    // 复制 types (从 core)
    await cp(join(coreSrc, 'types'), join(hooksDir, 'types'), { recursive: true });
    console.log(`✓ 复制 types`);

    // 2.5. 修复导入路径
    console.log('\n🔧 修复导入路径...');
    await fixImports(hooksDir);
    console.log(`✓ 导入路径已修复`);

    // 3. 生成 package.json
    const hooksPackageJsonPath = join(projectRoot, 'packages/hooks/package.json');
    const hooksPackageJson = JSON.parse(await readFile(hooksPackageJsonPath, 'utf-8'));

    // 提取依赖，排除 workspace 依赖
    const dependencies: Record<string, string> = {};
    if (hooksPackageJson.dependencies) {
      for (const [name, version] of Object.entries(hooksPackageJson.dependencies)) {
        if (typeof version === 'string' && !version.startsWith('workspace:')) {
          dependencies[name] = version;
        }
      }
    }

    // 添加 Claude Agent SDK（hooks 运行时需要）
    dependencies['@anthropic-ai/claude-agent-sdk'] = '^0.1.69';

    const packageJson = {
      name: "claude-hooks",
      type: "module",
      private: true,
      dependencies
    };

    await writeFile(
      join(hooksDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );
    console.log(`✓ 生成 package.json`);

    // 4. 复制 UserPromptSubmit.ts
    const userPromptSubmitSrc = join(projectRoot, '.claude/hooks/UserPromptSubmit.ts');
    await cp(userPromptSubmitSrc, join(hooksDir, 'UserPromptSubmit.ts'));
    console.log(`✓ 复制 UserPromptSubmit.ts`);

    // 5. 复制 prompts 目录和模板
    const promptsDir = join(claudeHome, 'prompts');
    await mkdir(promptsDir, { recursive: true });

    const variationsSrc = join(projectRoot, '.claude/prompts/variations.md');
    await cp(variationsSrc, join(promptsDir, 'variations.md'));
    console.log(`✓ 复制 variations.md`);

    // 6. 复制 .env 模板
    const envPath = join(claudeHome, '.env');
    if (!existsSync(envPath)) {
      const envTemplateSrc = join(projectRoot, '.claude/.env.template');
      await cp(envTemplateSrc, envPath);
      console.log(`✓ 复制 .env`);
    } else {
      console.log(`✓ .env 已存在`);
    }

    console.log('\n✅ 文件安装完成！\n');
    console.log('下一步:');
    console.log(`  1. 安装依赖:`);
    console.log(`     cd ${hooksDir}`);
    console.log(`     bun install`);
    console.log(``);
    console.log(`  2. 配置 settings.json:`);
    console.log(`     在 ${join(claudeHome, 'settings.json')} 中添加：`);
    console.log(`     {`);
    console.log(`       "hooks": {`);
    console.log(`         "UserPromptSubmit": "${join(hooksDir, 'UserPromptSubmit.ts')}"`);
    console.log(`       }`);
    console.log(`     }`);
    console.log(``);
    console.log(`  3. （可选）配置 Linear API Key:`);
    console.log(`     编辑 ${envPath}`);
    console.log(``);
    console.log(`  4. 重启 Claude Code`);
    console.log('');

  } catch (error) {
    console.error('\n❌ 安装失败:', error instanceof Error ? error.message : String(error));
    console.error('\n请确保你在 ai-dev-kit 项目目录中运行此命令');
    process.exit(1);
  }
}
