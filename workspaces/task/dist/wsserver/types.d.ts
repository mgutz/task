import { AppContext } from '../core/AppContext';
export interface ResolverContext {
    context: AppContext;
    tasks: Task[];
    authData: any;
}
