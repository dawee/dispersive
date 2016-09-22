const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const pick = require('101/pick');
const hat = require('hat');


class ModelBase extends EventEmitter {

  constructor(data = {}) {
    super();

    for (const key of Object.keys(this.schema)) {
      this[key] = data[key] || this.schema[key] || null;
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

const Model = (schema = {}) => class extends ModelBase {

  static get schema() {
    return schema;
  }

  get schema() {
    return this.constructor.schema;
  }
};

module.exports = Model;
