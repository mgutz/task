/// <reference types="node" />
import * as cp from 'child_process';
/**
 * shawn is short for shell spawns. It defaults to `bin/bash -c`. The options
 * are the same as node's ChildProcess. Additionally, `shell` and `shellArgs`
 * option props can be set to configure the the shell used.
 */
export declare const shawn: (script: string, options?: {
    shell: string;
    shellArgs: string[];
}) => cp.ChildProcess;
/**
 * sleep is used to sleep for arbitrary milliseconds.
 */
export declare const sleep: (millis: number) => Promise<void>;
