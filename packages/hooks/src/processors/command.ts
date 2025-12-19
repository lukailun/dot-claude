import type { Processor } from '@ai-dev-kit/core';
import { COMMANDS, type CommandKey } from '../commands';

/**
 * 处理命令前缀
 * 为以特定命令结尾的 prompt 添加对应的前缀
 * 示例: Hello :zh
 */
export const processCommand: Processor = (prompt: string): string => {
  const trimmedPrompt = prompt.trim();

  const matchedCommand = (Object.keys(COMMANDS) as CommandKey[]).find(
    (command) => trimmedPrompt.endsWith(command)
  );

  if (!matchedCommand) {
    return prompt;
  }

  const task = trimmedPrompt.slice(0, -matchedCommand.length).trim();

  if (!task) {
    return prompt;
  }

  return `${COMMANDS[matchedCommand].prefix}${task}`;
};
