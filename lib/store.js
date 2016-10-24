const ObjectManager = require('./manager');
const Schema = require('./schema');


class Store {

  register(name, model, {schema = {}, manager = ObjectManager}) {
    const ManagerType = manager;

    model.schema = new Schema(schema);
    model.objects = new ManagerType(model);

    this[name] = model.objects;
  }

  forget(name) {
    delete this[name];
  }

}

module.exports = Store;
