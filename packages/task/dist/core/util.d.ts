export declare const appWorkDirectory: string;
export declare const prettify: (o: any) => string;
/**
 * Safely parses string `s` return [obj, err]
 *
 * @param s The string to be parsed.
 */
export declare const safeParseJSON: (s: string) => any;
/**
 * Reads JSON file, returning an object.
 *
 * @param filename The JSON file to open.
 */
export declare const readJSONFile: (filename: string) => Promise<any>;
export declare const taskParam: (argv: Options, additionalProps?: any) => TaskParam;
/**
 * Returns the full path without dot extension.
 */
export declare const trimExtname: (path: string) => string;
