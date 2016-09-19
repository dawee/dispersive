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

const createModel = (schema = {}) => {
  const dispatcher = Dispatcher.main();
  let actionsMapping = {};

  class Model extends ModelBase {

    constructor(data = {}) {
      super();
      this.schema = clone(schema);

      for (const key of Object.keys(schema)) {
        this[key] = data[key] || schema[key] || null;
      }
    }

    delete() {
      Model.instances = Model.instances.filter((model) => model !== this);
    }

    static unsubscribeAll() {
      actionsMapping = {};
    }

    static subscribe(actionWrapper, handler) {
      const actionType = actionWrapper.action.actionType;

      if (! (actionType in actionsMapping)) actionsMapping[actionType] = new Set();

      actionsMapping[actionType].add(handler);
    }

    static create(data) {
      const ModelType = this;
      const model = new ModelType(data);

      Model.instances.push(model);
      return model;
    }
  }

  dispatcher.register((data) => {
    if (! (data.actionType in actionsMapping)) return;

    actionsMapping[data.actionType].forEach(
      (handler) => setTimeout(() => handler(omit(data, 'actionType')), 0)
    );
  });

  Model.instances = [];
  Model.objects = new QuerySet(Model);

  return Model;
};


exports.createModel = createModel;
