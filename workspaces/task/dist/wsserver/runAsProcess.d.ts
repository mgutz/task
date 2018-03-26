/// <reference types="node" />
import * as cp from 'child_process';
import { ResolverContext } from './types';
export interface RunAsProcessParam {
    context: ResolverContext;
    tag: string;
    taskfileId: string;
    taskName: string;
    argv: Options;
    client: any;
}
/**
 * Since node doesn't have goroutines and libraries like webworker-thread and
 * tiny-worker do not work well with `require`, the best we can do
 * is spawn a task as a child process. In effect, task is calling itself
 * with pre-built argv passed through env variable name `task_ipc_options`
 *
 * Task checks if `task_ipc_options` is set before doing anything else.
 *
 * The argv must have`_.[0]` be the task name and `server: false`.
 */
declare const runAsProcess: ({ context, tag, taskfileId, taskName, argv, client, }: RunAsProcessParam) => Promise<cp.ChildProcess>;
export declare const tailLog: (wsClient: any, logFile: string, tag: string, batchLines?: number, intervalMs?: number) => any;
export default runAsProcess;
