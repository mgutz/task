import { ResolverContext } from './types';
import { Project } from './types';
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use (code may be 0 too)
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export declare const addBookmark: (context: ResolverContext, bookmark: History) => Promise<any>;
export declare const fkill: (context: ResolverContext, argv: string[]) => Promise<any>;
/**
 * Loads and sets the project. The project may be reloaded by a
 * browser refresh. The project may only be loaded from a known location for
 * security purposes hence no arguments.
 */
export declare const loadProject: (context: ResolverContext) => Promise<Project>;
/**
 * Find process by pid, name or keyword.
 */
export declare const filterProcesses: (context: ResolverContext, kind: string, keyword: string) => Promise<any>;
export declare const tasks: (context: ResolverContext, taskfileId: string) => Promise<Task[]>;
/**
 * Runs a task by name found in taskfile entry from  `Taskproject.json`
 * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
 * args which may be overriden when inbound `argv` is merged.
 *
 * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
 */
export declare const run: (context: ResolverContext, tag: string, taskfileId: string, taskName: string, argv: Options) => {
    pid: number;
};
export declare const stop: (context: ResolverContext, pid: number) => "z" | undefined;
