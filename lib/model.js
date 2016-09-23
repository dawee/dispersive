const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const Schema = require('./schema');
const pick = require('101/pick');


class ModelBase extends EventEmitter {

  constructor(data = {}) {
    super();

    for (const [name, initial] of this.schema.initials()) {
      this[name] = name in data ? data[name] : initial;
    }
  }

  values(opts = {}) {
    const val = pick(this, [...this.schema.names()].filter(
      name => {
        if (!!opts.include && opts.include.indexOf(name) < 0) return false;
        if (!!opts.exclude && opts.exclude.indexOf(name) >= 0) return false;

        return true;
      }
    ));

    return val;
  }

  save(opts = {emitChange: true}) {
    this.constructor.objects.sync(this, opts);

    if (opts.emitChange) this.emitChange();

    return this;
  }

  delete() {
    this.constructor.objects.unsync(this);
  }

  static get objects() {
    this._objects = !!this._objects ? this._objects : new ObjectManager(this);

    return this._objects;
  }

}

const Model = fields => {
  const schema = new Schema(fields);

  return class extends ModelBase {

    static get schema() {
      return schema;
    }

    get schema() {
      return this.constructor.schema;
    }
  };
};


module.exports = Model;
