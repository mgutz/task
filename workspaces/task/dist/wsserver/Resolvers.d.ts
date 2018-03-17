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
    loadProject: () => Promise<{
        c: number;
        p: Project;
        e?: undefined;
    } | {
        c: number;
        e: any;
        p?: undefined;
    }>;
    tasks: (taskfileId: string) => Promise<{
        c: number;
        e: string;
        p?: undefined;
    } | {
        c: number;
        p: Task[];
        e?: undefined;
    }>;
    /**
     * Runs a task by name found in taskfile entry from  `Taskproject.json`
     * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
     * args which may be overriden when inbound `argv` is merged.
     *
     * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
     */
    run: (tag: string, taskfileId: string, taskName: string, argv: Options) => {
        c: number;
        e: string;
        p?: undefined;
    } | {
        c: number;
        p: {
            pid: number;
        };
        e?: undefined;
    };
}
