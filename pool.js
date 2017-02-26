class ActionPool {

  constructor() {
    this.delegations = [];
  }

  get empty() {
    return this.delegations.length === 0;
  }

  onActionResolved(emitter, res) {
    emitter.emit('resolve', {res});
    this.runNext();
  }

  onActionRejected(emitter, error) {
    emitter.emit('reject', {error});
    this.runNext();
  }

  runAction({action, emitter}) {
    action()
      .catch(error => this.onActionRejected(emitter, error))
      .then(res => this.onActionResolved(emitter, res));
  }

  runNext() {
    if (this.delegations.length > 0) this.runAction(this.delegations.shift());
  }

}

module.exports = {
  ActionPool,
};
