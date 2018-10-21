export declare const appWorkDirectory: string;
export declare const prettify: (o: any) => string;
/**
 * Safely parses string `s` return [obj, err]
 *
 * @param s JSON.stringified object.
 */
export declare const safeParseJSON: (s: string) => any;
export declare const readJSONFile: (filename: string) => Promise<any>;
export declare const taskParam: (argv: Options, additionalProps?: any) => TaskParam;
/**
 * Returns the full path to filename without extension.
 */
export declare const trimExtname: (path: string) => string;
