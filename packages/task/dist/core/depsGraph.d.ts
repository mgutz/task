/**
 * This does not optimally reduce the order and relies on the task runner
 * to smartly execute tasks which have not yet run. Parallelism introduces
 * complexities that make it difficult to reduce the graph and order. I'm sure
 * it can be done but for now I take advantage of knowing the behaviour of
 * the execution engine.
 */
export declare const execOrder: (tasks: Tasks, name: string) => any[];
