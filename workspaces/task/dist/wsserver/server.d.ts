import { AppContext } from '../core/AppContext';
export interface StartOptions {
    port: number;
}
export declare const start: (ctx: AppContext, opts: StartOptions) => Promise<void>;
