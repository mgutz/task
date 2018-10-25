import * as pino from 'pino';
/**
 * Konsole logs to terminal on host.
 */
export declare const konsole: pino.Logger;
export declare const setLevel: (level: string) => void;
export declare const newTerminalLogger: (name?: string) => pino.Logger;
export declare const getLogger: () => pino.Logger;
export declare const trace: (msg: string, obj: any) => void;
