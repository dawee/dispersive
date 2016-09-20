const ObjectManager = require('./manager');
const EventEmitter = require('./emitter');
const Dispatcher = require('./dispatcher');
const pick = require('101/pick');
const clone = require('101/clone');
const omit = require('101/omit');
const hat = require('hat');


class ModelBase extends EventEmitter {

  constructor(data = {}, schema = {}) {
    super();
    this.schema = clone(schema);

    for (const key of Object.keys(schema)) {
      this[key] = data[key] || schema[key] || null;
    }

    this.id = data.id || hat();
  }

  values() {
    return pick(this, Object.keys(this.schema));
  }

  delete() {
    this.constructor.objects().delete(this);
  }

  static objects() {
    this.staticObjects = !!this.staticObjects ? this.staticObjects : new ObjectManager(this);

    return this.staticObjects;
  }

  static mapping() {
    this.staticMapping = !!this.staticMapping ? this.staticMapping : {};
    return this.staticMapping;
  }

  static unsubscribeAll() {
    this.staticMapping = {};
  }

  static subscribe(actionWrapper, handler) {
    const actionType = actionWrapper.action.actionType;
    const actionsMapping = this.mapping();

    if (!this.registered) {
      this.dispatcher.register((data) => this.dispatch(data));
      this.registered = true;
    }

    if (! (actionType in actionsMapping)) actionsMapping[actionType] = new Set();

    actionsMapping[actionType].add(handler);
  }

  static dispatch(data) {
    const actionsMapping = this.mapping();

    if (! (data.actionType in actionsMapping)) return;

    actionsMapping[data.actionType].forEach(
      (handler) => setTimeout(() => handler(omit(data, 'actionType')), 0)
    );
  }

}

const createModel = (schema = {}, dispatcher = Dispatcher.main()) => {
  class Model extends ModelBase {

    constructor(data = {}) {
      super(data, schema);
    }

  }

  Model.dispatcher = dispatcher;
  return Model;
};


exports.createModel = createModel;
