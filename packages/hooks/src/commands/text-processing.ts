import type { CommandRegistry } from '@ai-dev-kit/core';

export const TEXT_PROCESSING = {
  ':analyze': {
    prefix: '针对以下内容，进行简要分析，指出核心问题和解决方向：',
    description: '分析'
  },
  ':explain': {
    prefix: '针对以下内容，使用通俗易懂的语言进行解释：',
    description: '通俗解释'
  },
  ':improve': {
    prefix: '优化以下文本的表达，使其更流畅专业：',
    description: '文本润色'
  },
  ':plan': {
    prefix: '针对以下内容，制定详细的分步计划：',
    description: '生成分步计划'
  },
  ':summarize': {
    prefix: '针对以下内容，进行总结：',
    description: '总结'
  }
} as const satisfies CommandRegistry;
