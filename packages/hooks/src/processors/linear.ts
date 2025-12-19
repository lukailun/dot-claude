import type { Processor } from '@ai-dev-kit/core';
import { getClaudeEnvPath } from '@ai-dev-kit/core/utils';
import { LinearClient } from "@linear/sdk";
import { config } from "dotenv";

config({ path: getClaudeEnvPath() });

/**
 * 处理 Linear issue 引用
 * 支持两种格式：
 * 1. linear(TEAM-123) - 完整格式
 * 2. 4t(1111) - 简写格式，会自动转换为 4t-1111
 */
export const processLinearReference: Processor = async (prompt: string): Promise<string> => {
  if (!process.env.LINEAR_API_KEY) {
    return prompt;
  }

  const linearClient = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY,
  });

  let result = prompt;

  // 匹配 linear(issueId) 格式
  const linearMatches = [...result.matchAll(/linear\((.*?)\)/g)];
  for (const match of linearMatches) {
    const issueId = match[1];
    try {
      const issue = await linearClient.issue(issueId ?? '');
      result = result.replace(
        match[0],
        JSON.stringify(issue, null, 2)
      );
    } catch (error) {
      console.error(`无法获取 Linear issue ${issueId}:`, error);
    }
  }

  return result;
};
