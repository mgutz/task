import { AppContext } from '../core/AppContext';
export interface StartOptions {
    port: number;
    resolvers: {
        [k: string]: ResolverFunc;
    };
}
export declare const start: (ctx: AppContext, opts: StartOptions) => Promise<void>;
