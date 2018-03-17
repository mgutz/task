import {AppContext} from '../core/AppContext'

export interface TaskfileInfo {
  id: string
  path: string
  argv: string[]
}

export interface Project {
  path: string
  taskfiles: TaskfileInfo[]
}

export interface ResolverContext {
  client: any
  context: AppContext
  authData: any
  project: Project
  projectDB: any
}
