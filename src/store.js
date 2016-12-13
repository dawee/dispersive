const ObjectManager = require('./manager');
const Schema = require('./schema');
const Model = require('./model');
const Tree = require('./tree');

class Store extends Tree {

  static createObjects({model = null, schema = {}, manager = ObjectManager}) {
    const ModelType = model || class extends Model {};
    const ManagerType = ModelType.manager || manager;

    ModelType.schema = new Schema(ModelType.schemaFields || schema);
    ModelType.objects = new ManagerType(ModelType);

    return ModelType.objects;
  }

  _register(name, {model = null, schema = {}, manager = ObjectManager}) {
    this[name] = Store.createObjects({model, schema, manager});
    this._leafs.add(name);

    return this[name];
  }

  create(data) {
    const tree = {};

    for (const childName of Object.keys(data)) {
      tree[childName] = this[childName].create(data[childName]);
    }

    return tree;
  }

  flush() {
    for (const [name, child] of this.children()) {
      child.flush(name);
    }
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
