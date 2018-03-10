import { ResolverContext } from './types';
export declare const tasks: (arg: any, ctx: ResolverContext) => Task[];
export declare const run: (a: any, ctx: ResolverContext) => Promise<{
    code: number;
    message: any;
    payload?: undefined;
} | {
    code: number;
    payload: string;
    message?: undefined;
}>;
