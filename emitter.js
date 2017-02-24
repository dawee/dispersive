const Immutable = require('immutable');


class Subscription {

  constructor({listener, emitter}) {
    this.emitter = emitter;
    this.trigger = event => listener(event);
  }

  remove() {
    this.emitter.remove(this);
    this.emitter = null;
  }

}


class ChangesEmitter {

  constructor() {
    this.subscriptions = Immutable.Set();
  }

  remove(subscription) {
    this.subscriptions = this.subscriptions.remove(subscription);
  }

  changed(listener) {
    const subscription = new Subscription({listener, emitter: this});

    this.subscriptions = this.subscriptions.add(subscription);
    return subscription;
  }

  emitChange(event = {}) {
    this.subscriptions.forEach(subscription => subscription.trigger(event));
  }

}

const createChangesEmitter = () => new ChangesEmitter();

module.exports = {
  Subscription,
  ChangesEmitter,
  createChangesEmitter,
};
