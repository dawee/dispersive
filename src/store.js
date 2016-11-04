const ObjectManager = require('./manager');
const Schema = require('./schema');
const Model = require('./model');
const Tree = require('./tree');

class Store extends Tree {

  _register(name, {model = null, schema = {}, manager = ObjectManager}) {
    const ManagerType = manager;
    const ModelType = model || class extends Model {};

    ModelType.schema = new Schema(schema);
    ModelType.objects = new ManagerType(ModelType);

    this[name] = ModelType.objects;
    this._leafs.add(name);

    return ModelType;
  }

}

module.exports = Store;
