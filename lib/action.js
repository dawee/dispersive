const hat = require('hat');
const Dispatcher = require('./dispatcher');

const noop = () => {};


class Action {

  static create(handler, standalone) {
    const action = new Action(handler, standalone);

    return action.boundWrapper;
  }

  constructor(handler, standalone) {
    this.actionType = hat();
    this.handler = handler;
    this.boundWrapper = this.wrapper.bind(this);
    this.boundTrigger = this.trigger.bind(this);
    this.boundWrapper.action = this;
    
    if (!standalone) {
      this.error = Action.create(noop, true);
      this.boundWrapper.error = this.error;
    }
  }

  trigger(data) {
    Dispatcher.main().trigger(this, data);
  }

  wrapper(...argv) {
    const result = (this.handler || noop).apply(null, argv);

    if (result instanceof Promise) {
      result.then(this.boundTrigger).catch(this.error);
    } else {
      this.boundTrigger(result);
    }
  }

}

module.exports = Action;
