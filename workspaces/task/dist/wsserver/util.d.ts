/// <reference types="node" />
import * as cp from 'child_process';
import { Project } from './types';
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
export declare const runAsProcess: (taskfileId: string, taskName: string, argv: Options, client: any) => cp.ChildProcess;
export declare const loadProjectFile: (argv: Options, isRunning?: boolean) => Promise<Project>;
