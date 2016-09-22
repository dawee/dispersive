const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const Dispatcher = require('./dispatcher');
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

  values() {
    return pick(this, Object.keys(this.schema).concat('id'));
  }

  delete() {
    this.constructor.objects.delete(this);
  }

  static get objects() {
    this._objects = !!this._objects ? this._objects : new ObjectManager(this);

    return this._objects;
  }

}

const createModel = (schema = {}) => class extends ModelBase {
  constructor(data = {}) {
    super(data, schema);
  }
};



exports.createModel = createModel;
