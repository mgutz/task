// decaffeinated from  https://github.com/lucagrulla/node-tail/blob/master/src/tail.coffee

/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const events = require('events');
const fs = require('fs');

const environment = process.env['NODE_ENV'] || 'development';

class Tail extends events.EventEmitter {
  readBlock() {
    if (this.queue.length >= 1) {
      const block = this.queue.shift();
      if (block.end > block.start) {
        const stream = fs.createReadStream(this.filename, {
          start: block.start,
          end: block.end - 1,
          encoding: this.encoding
        });
        stream.on('error', error => {
          if (this.logger) {
            this.logger.error(`Tail error: ${error}`);
          }
          return this.emit('error', error);
        });
        stream.on('end', () => {
          if (this.queue.length >= 1) {
            return this.internalDispatcher.emit('next');
          }
        });
        return stream.on('data', data => {
          this.buffer += data;

          const parts = this.buffer.split(this.separator);
          this.buffer = parts.pop();
          return Array.from(parts).map(chunk => this.emit('line', chunk));
        });
      }
    }
  }

  constructor(filename, options) {
    let pos, val, val1, val2, val3, val4, val5;
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) {
        super();
      }
      let thisFn = (() => {
        this;
      }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.readBlock = this.readBlock.bind(this);
    this.filename = filename;
    if (options == null) {
      options = {};
    }
    (val = options.separator),
      (this.separator = val != null ? val : /[\r]{0,1}\n/),
      (val1 = options.fsWatchOptions),
      (this.fsWatchOptions = val1 != null ? val1 : {}),
      (val2 = options.fromBeginning),
      (this.fromBeginning = val2 != null ? val2 : false),
      (val3 = options.follow),
      (this.follow = val3 != null ? val3 : true),
      (this.logger = options.logger),
      (val4 = options.useWatchFile),
      (this.useWatchFile = val4 != null ? val4 : false),
      (val5 = options.encoding),
      (this.encoding = val5 != null ? val5 : 'utf-8');

    if (this.logger) {
      this.logger.info('Tail starting...');
      this.logger.info(`filename: ${this.filename}`);
      this.logger.info(`encoding: ${this.encoding}`);
    }

    this.buffer = '';
    this.internalDispatcher = new events.EventEmitter();
    this.queue = [];
    this.isWatching = false;

    this.internalDispatcher.on('next', () => {
      return this.readBlock();
    });

    if (this.fromBeginning) {
      pos = 0;
    }
    this.watch(pos);
  }

  watch(pos) {
    let stats;
    if (this.isWatching) {
      return;
    }
    this.isWatching = true;
    try {
      stats = fs.statSync(this.filename);
    } catch (err) {
      if (this.logger) {
        this.logger.error(`watch for ${this.filename} failed: ${this.err}`);
      }
      this.emit('error', `watch for ${this.filename} failed: ${this.err}`);
      return;
    }
    this.pos = pos != null ? pos : stats.size;

    if (this.logger) {
      this.logger.info(`filesystem.watch present? ${fs.watch !== undefined}`);
      this.logger.info(`useWatchFile: ${this.useWatchFile}`);
    }

    if (!this.useWatchFile && fs.watch) {
      if (this.logger) {
        this.logger.info('watch strategy: watch');
      }
      return (this.watcher = fs.watch(this.filename, this.fsWatchOptions, e => this.watchEvent(e)));
    } else {
      if (this.logger) {
        this.logger.info('watch strategy: watchFile');
      }
      return fs.watchFile(this.filename, this.fsWatchOptions, (curr, prev) =>
        this.watchFileEvent(curr, prev)
      );
    }
  }

  watchEvent(e) {
    if (e === 'change') {
      let stats;
      try {
        stats = fs.statSync(this.filename);
      } catch (err) {
        if (this.logger) {
          this.logger.error(`'change' event for ${this.filename}. ${this.err}`);
        }
        this.emit('error', `'change' event for ${this.filename}. ${this.err}`);
        return;
      }
      if (stats.size < this.pos) {
        this.pos = stats.size;
      } //scenario where texts is not appended but it's actually a w+
      if (stats.size > this.pos) {
        this.queue.push({start: this.pos, end: stats.size});
        this.pos = stats.size;
        if (this.queue.length === 1) {
          return this.internalDispatcher.emit('next');
        }
      }
    } else if (e === 'rename') {
      this.unwatch();
      if (this.follow) {
        return setTimeout(() => this.watch(), 1000);
      } else {
        if (this.logger) {
          this.logger.error(`'rename' event for ${this.filename}. File not available.`);
        }
        return this.emit('error', `'rename' event for ${this.filename}. File not available.`);
      }
    }
  }

  watchFileEvent(curr, prev) {
    if (curr.size > prev.size) {
      this.queue.push({start: prev.size, end: curr.size});
      if (this.queue.length === 1) {
        return this.internalDispatcher.emit('next');
      }
    }
  }

  unwatch() {
    if (this.watcher) {
      this.watcher.close();
    } else {
      fs.unwatchFile(this.filename);
    }
    this.isWatching = false;
    return (this.queue = []);
  }
}

exports.Tail = Tail;
