export declare const runnableRef: (tasks: Tasks, ref: string) => string;
export declare const addSeriesRef: (tasks: Tasks, task: Task, deps: any[]) => string;
export declare const makeParallelRef: (tasks: Tasks, task: Task, dep: any) => string;
export declare const depToRef: (tasks: Tasks, task: Task, dep: any) => string | null;
export declare const findTaskfile: (argv: Options) => string | null;
/**
 * Use task's built-in babel.
 */
export declare const configureBabel: (argv: Options, taskfilePath: string) => void;
/**
 * Loads and standardize tasks.
 *
 * type task struct {
 *  deps []string
 *  desc string
 *  every bool
 *  name string
 *  once bool
 *  run function
 *  _parallel bool
 *  _ran bool       // whether task ran on current watch change
 * }
 */
export declare const loadTasks: (argv: Options, taskfilePath: string) => Promise<Tasks | null>;
export declare const standardizeFile: (v: any, argv: Options) => Promise<Tasks>;
export declare const standardizeTask: (tasks: Tasks, k: string, v: any) => Task;
