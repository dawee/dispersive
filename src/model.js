const clone = require('clone');
const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const {pick} = require('./object');


class Model extends EventEmitter.Emittable {

  static using({schema = null, manager = ObjectManager}) {
    return class extends Model {
      static get schemaFields() {
        return schema;
      }

      static get manager() {
        return manager;
      }

      static get model() {
        return this;
      }
    };
  }

  constructor(data = {}) {
    super();

    if (!this.objects) throw new Model.NoObjectManager();
    if (!this.schema) throw new ObjectManager.NoSchema();
    if ('id' in data && !this.objects.isValidId(data.id)) delete data.id;

    Object.assign(this, this.schema.initialValues);
    Object.assign(this, data);
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

  update(values = {}, opts) {
    const predicate = typeof values === 'function' ? values : null;
    const id = this.id;

    if (predicate) {
      predicate(this);
    } else {
      Object.assign(this, values);
    }

    this.id = id;
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
