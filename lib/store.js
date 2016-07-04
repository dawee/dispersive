const QuerySet = require('./queryset');
const EventEmitter = require('fbemitter').EventEmitter;
const Dispatcher = require('./dispatcher');


class Store extends EventEmitter {

  constructor(dispatcher) {
    super();
    this.values = [];
    this.dispatcher = dispatcher || Dispatcher.main();
  }

  on(name, listener) {
    return this.addListener(name, listener);
  }

  bindAction(action, handler) {
    return this.dispatcher.on(action, handler);
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