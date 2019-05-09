import * as pino from 'pino';
export declare const newTerminalLogger: (name?: string, opts?: {}) => pino.Logger;
/**
 * PlainPrettier is a simple prettifier to display messages and optionally color
 * the logline based on the level. Colors are disabled if --no-colors is set.
 *
 * @param options is passed in by pino.
 */
export declare const plainPrettifier: (options: any) => (inputData: any) => any;
/**
 * Konsole is used for interactive terminals. It should not be JSON.
 */
export declare const konsole: pino.Logger;
export declare const setLevel: (level: string) => void;
export declare const getLogger: () => pino.Logger;
export declare const trace: (msg: string, obj?: any) => void;
