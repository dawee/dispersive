const ObjectManager = require('./manager');
const Schema = require('./schema');
const Model = require('./model');


class Store {

  register(name, {model = null, schema = {}, manager = ObjectManager}) {
    const ManagerType = manager;
    const ModelType = model || class extends Model {};

    ModelType.schema = new Schema(schema);
    ModelType.objects = new ManagerType(ModelType);

    this[name] = ModelType.objects;

    return ModelType;
  }

  forget(name) {
    delete this[name];
  }

}

module.exports = Store;
