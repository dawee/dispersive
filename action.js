const hat = require('hat');
const dispatcher = require('./dispatcher');

const noop = () => {};
const noopAsync = (trigger) => trigger({});


class Action {

  static create(handler) {
    const action = new Action(handler);

    return action.boundWrapper;
  }

  static createAsync(handler) {
    const action = new Action(handler);

    return action.boundAsyncWrapper;
  };

  constructor(handler) {
    this.actionType = hat();
    this.handler = handler;
    this.boundWrapper = this.wrapper.bind(this);
    this.boundAsyncWrapper = this.asyncWrapper.bind(this);
    this.boundTrigger = this.trigger.bind(this);
    this.boundWrapper.action = this;
    this.boundAsyncWrapper.action = this;
  }

  trigger(result) {
    let data = result || {};

    data.actionType = this.actionType;
    dispatcher.dispatch(data);
  }

  asyncWrapper(...argv) {
    argv.push(this.boundTrigger);
    (this.handler || noopAsync).apply(null, argv);
  }

  wrapper(...argv) {
    const result = (this.handler || noop).apply(null, argv);
    this.boundTrigger(result);
  }

}

module.exports = Action;
