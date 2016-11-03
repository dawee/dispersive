const ObjectManager = require('./manager');
const Schema = require('./schema');
const Model = require('./model');


class Store {

  constructor() {
    this._models = new Set();
    this._stores = new Set();
  }

  get models() {
    let models = Array.from(this._models);

    for (const name of this._stores) {
      models = models.concat(`${name}.${this[name].models}`);
    }

    return models;
  }

  _registerModel(name, {model = null, schema = {}, manager = ObjectManager}) {
    const ManagerType = manager;
    const ModelType = model || class extends Model {};

    ModelType.schema = new Schema(schema);
    ModelType.objects = new ManagerType(ModelType);

    this[name] = ModelType.objects;
    this._models.add(name);

    return ModelType;
  }

  register(name, sub) {
    if (name in this) return;

    if (!!sub && sub instanceof Store) {
      const store = sub;

      this[name] = store;
      this._stores.add(name);
      return store;
    }

    return this._registerModel(name, sub || {});
  }

  forget(name) {
    if (this._stores.has(name)) {
      this._stores.delete(name);
      delete this[name];
    } else if (this._models.has(name)) {
      this._models.delete(name);
      delete this[name];
    }
  }

}

module.exports = Store;
