const clone = require('clone');
const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const {pick} = require('./object');


class Model extends EventEmitter.Emittable {

  constructor(data = {}) {
    super();

    if (!this.objects) throw new Model.NoObjectManager();
    if (!this.schema) throw new ObjectManager.NoSchema();

    this.schema.initModel(this);
    this.assign(data, false);
  }

  schemaValues() {
    return clone(pick(this, ...[...this.schema.names()]));
  }

  values(opts = {}) {
    const values = pick(this, ...[...this.schema.names()].filter(
      name => {
        if (!!opts.include && opts.include.indexOf(name) < 0) return false;
        if (!!opts.exclude && opts.exclude.indexOf(name) >= 0) return false;

        return true;
      }
    ));

    return values;
  }

  on(...argv) {
    if (!this.emitter) throw new Model.EmitterNotReady();
    return super.on(...argv);
  }

  emit(...argv) {
    if (!this.emitter) throw new Model.EmitterNotReady();
    return super.emit(...argv);
  }

  save(opts = {emitChange: true}) {
    this.constructor.objects.sync(this, opts);
    return this;
  }

  assign(values = {}, keepId = true) {
    const predicate = typeof values === 'function' ? values : null;
    const _id = this._id;

    if (predicate) {
      predicate(this);
    } else {
      Object.assign(this, values);
    }

    if (keepId || !this.objects.isValidId(this._id)) this._id = _id;
  }

  update(values, opts) {
    this.assign(values);
    this.save(opts);
  }

  delete() {
    this.objects.unsync(this);
  }

  get schema() {
    return this.constructor.schema;
  }

  get objects() {
    return this.constructor.objects;
  }

}

Model.EmitterNotReady = class {

  constructor() {
    this.name = 'EmitterNotReady';
    this.message = 'Emitter cannot be used before saving the model';
  }

};

Model.NoObjectManager = class {

  constructor() {
    this.name = 'NoObjectManager';
    this.message = 'Model has no Object Manager. Use Model.attach() or Model.use()';
  }

};


module.exports = Model;
