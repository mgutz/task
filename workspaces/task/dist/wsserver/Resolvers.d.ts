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
    tasks: (taskfileID: string) => Promise<{
        c: number;
        e: string;
        p?: undefined;
    } | {
        c: number;
        p: Task[];
        e?: undefined;
    }>;
    run: (name: string, argv: Dict<string, any>) => {
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
