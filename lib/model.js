const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const Schema = require('./schema');
const {pick} = require('./object');


class Model extends EventEmitter.Emittable {

  constructor(data = {}) {
    super();

    for (const [name, initial] of this.schema.initials()) {
      this[name] = name in data ? data[name] : initial;
    }
  }

  values(opts = {}) {
    const val = pick(this, ...[...this.schema.names()].filter(
      name => {
        if (!!opts.include && opts.include.indexOf(name) < 0) return false;
        if (!!opts.exclude && opts.exclude.indexOf(name) >= 0) return false;

        return true;
      }
    ));

    return val;
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

    if (opts.emitChange) this.emitChange();

    return this;
  }

  delete() {
    this.constructor.objects.unsync(this);
  }

  get schema() {
    return this.constructor.schema;
  }

  static createSchema(fields = {}) {
    return (fields instanceof Schema) ? fields : new Schema(fields);
  }

  static get schema() {
    this._schema = !!this._schema ? this._schema : this.createSchema();

    return this._schema;
  }

  static get objects() {
    this._objects = !!this._objects ? this._objects : new ObjectManager(this);

    return this._objects;
  }

  static use(fields) {
    return class extends Model {
      static createSchema() {
        return super.createSchema(fields);
      }
    };
  }

}

Model.EmitterNotReady = class {

  constructor() {
    this.name = 'EmitterNotReady';
    this.message = 'Emitter cannot be used before saving the model';
  }

};


module.exports = Model;
