import { Project } from './types';
export declare const loadProjectFile: (argv: Options, isRunning?: boolean) => Promise<Project>;
export declare const relativeToHomeDir: (path: string) => string;
/**
 * The client MUST NOT be allowed to override taskfile and projectfile.
 * @param argv Users
 */
export declare const sanitizeInboundArgv: (argv: Options) => Options;
export interface LogBaseParam {
    extName?: string;
    pid?: string;
    taskfileId: string;
    taskName: string;
    timestamp: string;
}
export declare const logBase: (arg: LogBaseParam) => string;
export declare const getExecHistory: (taskfileId: string, taskName: string) => Promise<ExecInfo[]>;
export declare const formatDate: (d?: Date) => string;
