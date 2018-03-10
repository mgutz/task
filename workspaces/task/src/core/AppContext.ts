import * as pino from 'pino'
import {newTerminalLogger} from './log'

export class AppContext {
  public log: pino.Logger

  constructor(
    public tasks: Tasks,
    public options: Options,
    public konsole: pino.Logger // Always logs to host's console
  ) {
    this.log = newTerminalLogger()
  }
}
