const QuerySet = require('./queryset');
const EventEmitter = require('fbemitter').EventEmitter;
const Dispatcher = require('./dispatcher');
const omit = require('101/omit');


class Store extends EventEmitter {

  constructor(dispatcher) {
    super();
    this.values = [];
    this.eventMapping = {};
    this.dispatcher = dispatcher || Dispatcher.main();
    this.dispatcher.register(this.forwardData.bind(this));
  }

  on(name, listener) {
    return this.addListener(name, listener);
  }

  forwardData(data) {
    if (! (data.actionType in this.eventMapping)) return;

    this.eventMapping[data.actionType].forEach(
      (handler) => handler(omit(data, 'actionType'))
    );
  }

  bindAction(actionWrapper, handler) {
    const actionType = actionWrapper.action.actionType;

    if (! (actionType in this.eventMapping)) this.eventMapping[actionType] = new Set([]);

    this.eventMapping[actionType].add(handler);
  }

  unbindAll() {
    this.eventMapping = {};
  }

  trigger(name, data) {
    this.emit(name, data);
  }

  filter(expression) {
    return new QuerySet(this).filter(expression);
  }

  exclude(expression) {
    return new QuerySet(this).exclude(expression);
  }

  all() {
    return new QuerySet(this).all();
  }

  first() {
    return new QuerySet(this).first();
  }

  get(expression) {
    return new QuerySet(this).get(expression);
  }

  count() {
    return this.values.length;
  }

  delete(entry) {
    const index = this.values.indexOf(entry);

    if (index > -1) this.values.splice(index, 1);
  }

  create(entry) {
    this.values.push(entry);
  }

}

module.exports = Store;
