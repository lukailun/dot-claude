import type { UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk";
import { getEnabledProcessors } from "@ai-dev-kit/hooks";

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
