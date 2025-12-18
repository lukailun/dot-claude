export const CODE_DEVELOPMENT = {
  ':code': {
    prefix: '为以下需求编写代码：',
    description: '代码编写'
  },
  ':comment': {
    prefix: '为以下代码添加详细的注释：',
    description: '代码注释'
  },
  ':debug': {
    prefix: '针对以下内容，进行调试分析并提供解决方案：',
    description: '调试分析'
  },
  ':document': {
    prefix: '为以下代码编写技术文档：',
    description: '技术文档生成'
  },
  ':refactor': {
    prefix: '重构以下代码，提高可读性和性能：',
    description: '代码重构'
  },
  ':review': {
    prefix: '为以下代码进行代码审查，指出问题和改进建议：',
    description: '代码审查'
  },
  ':test': {
    prefix: '为以下代码编写测试用例：',
    description: '测试用例生成'
  }
} as const;
