export declare const error: (err: any, code?: number) => void;
export declare const errorFn: (code?: number) => (err: any) => void;
export declare const ok: (msg: string) => void;
export declare const okFn: (msg?: string) => () => void;
export declare const message: (msg: string, code?: number) => void;
