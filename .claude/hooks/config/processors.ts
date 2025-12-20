/**
 * 向后兼容导出
 * @deprecated 请直接使用 @ai-dev-kit/hooks
 */
export type { Processor, ProcessorConfig } from '@ai-dev-kit/core';
export {
  AVAILABLE_PROCESSORS,
  getEnabledProcessors
} from '@ai-dev-kit/hooks';
