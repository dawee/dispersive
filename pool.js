class ActionPool {

  constructor() {
    this.delegations = [];
  }

  get empty() {
    return this.delegations.length === 0;
  }

  addDelegation(action, resolve, reject) {
    this.delegations.push({action, resolve, reject});
    if (this.delegations.length === 1) this.runNext();
  }

  delegate(action) {
    return new Promise((resolve, reject) => this.addDelegation(action, resolve, reject));
  }

  onActionResolved(resolve, res) {
    resolve(res);
    this.onActionDone();
  }

  onActionRejected(reject, error) {
    reject(error);
    this.onActionDone();
  }

  onActionDone() {
    this.runNext();
    this.delegations.shift();
  }

  runAction({action, resolve, reject}) {
    action()
      .catch(error => this.onActionRejected(reject, error))
      .then(res => this.onActionResolved(resolve, res));
  }

  runNext() {
    if (this.delegations.length > 0) this.runAction(this.delegations[0]);
  }

}

const createActionPool = () => new ActionPool();

module.exports = {
  ActionPool,
  createActionPool,
};
