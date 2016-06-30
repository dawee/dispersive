const hat = require('hat');
const dispatcher = require('./dispatcher');

const noop = () => {};
const noopAsync = (trigger) => trigger({});
const lastArg = (argv) => argv.length === 0 ? null : argv[argv.length - 1];
const firstArgs = (argv) => argv.length < 2 ? [] : argv.slice(0, argv.length - 1);


class Action {

  static createAsync(handler) {
    const action = new Action(handler);

    return action.boundWrapper;
  };

  static create(handler) {
    return Action.create((...argv) => lastArg(argv)(
      (handler || noop).apply((handler || null), firstArgs(argv)))
    );
  }

  constructor(handler) {
    this.actionType = hat();
    this.handler = handler || noopAsync;
    this.boundWrapper = this.wrapper.bind(this);
    this.boundTrigger = this.trigger.bind(this);
    this.boundWrapper.action = this;
  }

  trigger(result) {
    let data = result || {};

    data.actionType = this.actionType;
    dispatcher.dispatch(data);
  }

  wrapper(...argv) {
    argv.push(this.boundTrigger);
    (this.handler || noopAsync).apply(null, argv);
  }

}

module.exports = Action;
