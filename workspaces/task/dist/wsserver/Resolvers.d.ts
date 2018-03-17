import { ResolverContext } from './types';
import { Project } from './types';
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export declare class Resolvers {
    rcontext: ResolverContext;
    constructor(rcontext: ResolverContext);
    addHistory: (history: History) => Promise<any>;
    /**
     * Loads and sets the project. The project may be reloaded by a
     * browser refresh. The project may only be loaded from a known location for
     * security purposes hence no arguments.
     */
    loadProject: () => Promise<Project>;
    tasks: (taskfileId: string) => Promise<Task[]>;
    /**
     * Runs a task by name found in taskfile entry from  `Taskproject.json`
     * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
     * args which may be overriden when inbound `argv` is merged.
     *
     * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
     */
    run: (tag: string, taskfileId: string, taskName: string, argv: Options) => {
        pid: number;
    };
}
