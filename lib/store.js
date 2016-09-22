const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const pick = require('101/pick');
const clone = require('101/clone');
const hat = require('hat');


class ModelBase extends EventEmitter {

  constructor(data = {}, schema = {}) {
    super();
    this.schema = clone(schema);

    for (const key of Object.keys(schema)) {
      this[key] = data[key] || schema[key] || null;
    }

    this.id = data.id || hat();
  }

  values(opts = {}) {
    const keys = Object.keys(this.schema).concat('id');

    return pick(this, keys.filter(
      key => {
        if (!!opts.include && opts.include.indexOf(key) < 0) return false;
        if (!!opts.exclude && opts.exclude.indexOf(key) >= 0) return false;

        return true;
      }
    ));
  }

  delete() {
    this.constructor.objects.delete(this);
  }

  static get objects() {
    this._objects = !!this._objects ? this._objects : new ObjectManager(this);

    return this._objects;
  }

}

const createModel = schema => class extends ModelBase {
  constructor(data = {}) {
    super(data, schema);
  }
};


exports.createModel = createModel;
