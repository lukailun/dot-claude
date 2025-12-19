/**
 * 获取 Claude 配置目录
 */
export function getClaudeHome(): string {
  return process.env.CLAUDE_HOME ?? `${process.env.HOME}/.claude`;
}

export function getClaudeEnvPath(): string {
  return `${getClaudeHome()}/.env`;
}

export function getClaudePromptsPath(): string {
  return `${getClaudeHome()}/prompts`;
}
