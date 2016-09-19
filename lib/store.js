/* eslint no-console: "off" */

const QuerySet = require('./queryset');
const EventEmitter = require('./emitter');
const Dispatcher = require('./dispatcher');
const pick = require('101/pick');
const clone = require('101/clone');
const omit = require('101/omit');


class ModelBase extends EventEmitter {

  values() {
    return pick(this, Object.keys(this.schema));
  }

}

const createModel = (schema) => {
  schema = schema || {};

  const dispatcher = Dispatcher.main();

  let eventMapping = {};

  class Model extends ModelBase {

    constructor(data) {
      super();

      data = data || {};
      this.schema = clone(schema);

      for (const key of Object.keys(schema)) {
        this[key] = data[key] || null;
      }
    }

    delete() {
      Model.instances = Model.instances.filter((model) => model !== this);
    }

  }

  Model.unbindAll = () => {
    eventMapping = {};
  };

  Model.bindAction = (actionWrapper, handler) => {
    const actionType = actionWrapper.action.actionType;

    if (! (actionType in eventMapping)) eventMapping[actionType] = new Set();

    eventMapping[actionType].add(handler);
  };

  Model.create = function createModelInstance(data) {
    const ModelType = this;
    const model = new ModelType(data);

    Model.instances.push(model);
    return model;
  };

  dispatcher.register((data) => {
    if (! (data.actionType in eventMapping)) return;

    eventMapping[data.actionType].forEach((handler) => {
      try {
        handler(omit(data, 'actionType'));
      } catch (err) {
        if (!!console.error) {
          console.error(err);
        } else {
          console.log(err);
        }
      }
    });
  });

  Model.instances = [];
  Model.objects = new QuerySet(Model);

  return Model;
};


exports.createModel = createModel;
