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
    tasks: (arg: any) => Task[];
    run: (a: any) => Promise<{
        code: number;
        message: any;
        payload?: undefined;
    } | {
        code: number;
        payload: string;
        message?: undefined;
    }>;
}
