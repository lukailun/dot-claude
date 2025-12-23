/**
 * Adapter 基础接口
 */

export interface AdapterConfig {
  /** 启用的处理器 */
  processors?: string[];
  /** 目标安装目录（默认自动检测） */
  targetDir?: string;
  /** 是否强制覆盖 */
  force?: boolean;
}

export interface GeneratedFiles {
  /** Hook 入口文件内容 */
  hookCode: string;
  /** package.json 内容 */
  packageJson: string;
  /** 其他需要生成的文件 */
  additionalFiles?: Record<string, string>;
}

/**
 * IDE Adapter 接口
 */
export abstract class IDEAdapter {
  constructor(protected config: AdapterConfig) {}

  /**
   * 获取目标 IDE 的安装路径
   */
  abstract getInstallPath(): string;

  /**
   * 生成 hook 入口文件
   */
  abstract generateHook(): string;

  /**
   * 生成 package.json
   */
  abstract generatePackageJson(): string;

  /**
   * 生成所有需要的文件
   */
  async generateFiles(): Promise<GeneratedFiles> {
    return {
      hookCode: this.generateHook(),
      packageJson: this.generatePackageJson(),
      additionalFiles: await this.generateAdditionalFiles(),
    };
  }

  /**
   * 生成其他平台特定文件（可选）
   */
  protected async generateAdditionalFiles(): Promise<Record<string, string>> {
    return {};
  }

  /**
   * 执行安装
   */
  abstract install(): Promise<InstallResult>;

  /**
   * 安装依赖
   */
  abstract installDependencies(targetDir: string): Promise<void>;
}

/**
 * 安装结果
 */
export interface InstallResult {
  success: boolean;
  targetDir: string;
  filesCreated: string[];
  message: string;
}
