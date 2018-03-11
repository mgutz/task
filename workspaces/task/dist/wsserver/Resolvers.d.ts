import { ResolverContext } from './types';
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export declare class Resolvers {
    rcontext: ResolverContext;
    constructor(rcontext: ResolverContext);
    tasks: (arg: any) => {
        c: number;
        p: Task[];
    };
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
