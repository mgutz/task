/// <reference types="node" />
import { ChildProcess } from 'child_process';
export declare const parallelTask: (task: any) => task is ParallelTask;
export declare const serialTask: (task: any) => task is SerialTask;
export declare const childProcess: (v: any) => v is ChildProcess;
export declare const promise: (v: any) => boolean;
export declare const runnable: (task: any) => task is Task;
