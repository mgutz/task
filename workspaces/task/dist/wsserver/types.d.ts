import { AppContext } from '../core/AppContext';
export interface ResolverContext {
    client: any;
    context: AppContext;
    tasks: Task[];
    authData: any;
}
