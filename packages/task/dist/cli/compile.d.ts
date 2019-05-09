export declare const shouldCompile: (argv: Options, taskfilePath: string) => Promise<boolean>;
/**
 * Build conditionally builds the task file. The task file is rebuilt when
 *
 * - --compile flag is set on CLI
 * - compiled file does not exist
 * - task file is newer than compiled file
 * - compiled file is older than nearest package file
 */
export declare const build: (argv: Options, taskfilePath: string) => Promise<string>;
