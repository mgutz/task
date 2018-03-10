export declare const watch: (globs: string[], args: TaskParam, fn: TaskFunc, opts?: {
    usePolling: boolean;
}) => Promise<void>;
