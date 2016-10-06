const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const Schema = require('./schema');
const {pick} = require('./object');


class Model extends EventEmitter.Emittable {

  constructor(data = {}) {
    super();

    if (!this.objects()) throw new Model.NoObjectManager();
    if (!this.schema()) throw new ObjectManager.NoSchema();
    if ('id' in data && !this.objects().isValidId(data.id)) delete data.id;

    for (const [name, initial] of this.schema().initials()) {
      this[name] = name in data ? data[name] : initial;
    }
  }

  values(opts = {}) {
    const val = pick(this, ...[...this.schema().names()].filter(
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
    this.objects().unsync(this);
  }

  schema() {
    return this.constructor.schema;
  }

  objects() {
    return this.constructor.objects;
  }

  static use(fields = {}) {
    const ModelMixin = class extends Model {
      static get schema() {
        this._schema = !!this._schema ? this._schema : new Schema(fields);

        return this._schema;
      }

      static get objects() {
        this._objects = !!this._objects ? this._objects : new ObjectManager(this);

        return this._objects;
      }
    };

    return ModelMixin;
  }

  static attach(ModelType, fields = {}) {
    ModelType.schema = new Schema(fields);
    ModelType.objects = new ObjectManager(ModelType);

    return ModelType;
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
