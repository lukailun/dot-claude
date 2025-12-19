import type { CommandRegistry } from '@ai-dev-kit/core';

export const TRANSLATION = {
  ':en': {
    prefix: 'Translate the following into natural English: ',
    description: '翻译为英文'
  },
  ':zh': {
    prefix: '将以下内容翻译成中文：',
    description: '翻译为中文'
  }
} as const satisfies CommandRegistry;
