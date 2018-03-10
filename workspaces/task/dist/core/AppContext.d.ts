/// <reference types="pino" />
import * as pino from 'pino';
export declare class AppContext {
    tasks: Tasks;
    options: Options;
    konsole: pino.Logger;
    log: pino.Logger;
    constructor(tasks: Tasks, options: Options, konsole: pino.Logger);
}
