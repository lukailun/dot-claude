/**
 * 核心处理器类型
 */
export type Processor = (prompt: string) => string | Promise<string>;

/**
 * 处理器配置
 */
export interface ProcessorConfig {
  name: string;
  processor: Processor;
  enabled?: boolean;
}
