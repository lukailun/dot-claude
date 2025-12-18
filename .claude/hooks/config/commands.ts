import { CODE_DEVELOPMENT } from './code-development';
import { TEXT_PROCESSING } from './text-processing';
import { TRANSLATION } from './translation';

export type CommandKey = keyof typeof COMMANDS;

export const COMMANDS = {
  ...CODE_DEVELOPMENT,
  ...TEXT_PROCESSING,
  ...TRANSLATION
} as const;