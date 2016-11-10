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

  create(data) {
    const tree = {};

    for (const childName of Object.keys(data)) {
      tree[childName] = this[childName].create(data[childName]);
    }

    return tree;
  }

  values(opts) {
    const values = {};

    for (const [name, child] of this.children()) {
      values[name] = child.values(opts);
    }

    return values;
  }

}

module.exports = Store;
