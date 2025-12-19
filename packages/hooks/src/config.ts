import type { ProcessorConfig } from '@ai-dev-kit/core';
import { processCommand } from './processors/command';
import { processLinearReference } from './processors/linear';
import { processVariation } from './processors/variation';

/**
 * 所有可用的 processors
 * 按执行顺序排列
 * 修改 enabled 字段来启用/禁用特定的 processor
 */
export const AVAILABLE_PROCESSORS: ProcessorConfig[] = [
  {
    name: 'linear',
    processor: processLinearReference,
    enabled: true
  },
  {
    name: 'command',
    processor: processCommand,
    enabled: true
  },
  {
    name: 'variation',
    processor: processVariation,
    enabled: true
  }
];

/**
 * 获取启用的 processors
 * 只返回 enabled 为 true 的 processors
 */
export function getEnabledProcessors(): ProcessorConfig[] {
  return AVAILABLE_PROCESSORS.filter(processor => processor.enabled !== false);
}
