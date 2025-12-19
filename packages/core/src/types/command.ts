/**
 * 命令定义
 */
export interface CommandDefinition {
  prefix: string;
  description: string;
}

/**
 * 命令集合
 */
export type CommandRegistry = Record<string, CommandDefinition>;
