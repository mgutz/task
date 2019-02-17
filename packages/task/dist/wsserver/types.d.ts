import { AppContext } from '../core/AppContext';
export interface TaskfileInfo {
    id: string;
    path: string;
    argv: string[];
}
export interface Project {
    path: string;
    server: ServerOptions;
    taskfiles: TaskfileInfo[];
}
export interface ServerOptions {
    logPathPattern: string;
}
export interface ResolverContext {
    client: any;
    app: AppContext;
    authData: any;
    project: Project;
    projectDB: any;
}
