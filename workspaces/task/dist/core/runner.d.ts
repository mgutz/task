import { AppContext } from './AppContext';
export declare const run: (ctx: AppContext, name: string, args?: TaskParam | undefined) => Promise<TaskResult[]>;
export declare const runThenWatch: (ctx: AppContext, name: string) => Promise<void>;
export declare const taskParam: (argv: Options, additionalProps?: any) => TaskParam;
