const {EventEmitter} = require('fbemitter');
const ulid = require('ulid');

const CHANGE_EVENT = 'change';

class ChangesEmitter {

  constructor() {
    this.emitter = new EventEmitter();
  }

  emitChange(event = {}) {
    this.emitter.emit(CHANGE_EVENT, event);
  }

  changed(listener) {
    return this.emitter.addListener(CHANGE_EVENT, listener);
  }

}

class FunnelSubscription {

  constructor({funnel, subscription}) {
    this.id = ulid();
    this.funnel = funnel;
    this.subscription = subscription;
  }

  remove() {
    if (!this.subscription || !this.funnel) return;

    this.subscription.remove();
    this.funnel.removeSubscription(this);
    this.subscription = null;
    this.funnel = null;
  }

}

const getEmitters = ({models = [], emitters = []}) => (
  models.map(({emitter}) => emitter).concat(emitters)
);

class ChangesFunnelEmitter {

  constructor(opts = {models: [], emitters: []}) {
    this.mainSubscriptions = [];
    this.mainEmitter = new ChangesEmitter();
    this.emitters = getEmitters(opts);
    this.subscriptions = {};
  }

  isSameEvent({eventId = null}) {
    return this.eventId && (this.eventId === eventId);
  }

  forwardChangeEvent(event = {}) {
    if (this.isSameEvent(event)) return;

    this.eventId = event.eventId;
    this.mainEmitter.emitChange(event);
  }

  createMainSubscriptions() {
    this.mainSubscriptions = this.emitters.map(emitter => (
      emitter.changed(event => this.forwardChangeEvent(event))
    ));
  }

  clearMainSubscriptions() {
    this.mainSubscriptions.forEach(subscription => subscription.remove());
    this.mainSubscriptions = [];
  }

  addSubscription(listener) {
    const subscription = new FunnelSubscription({
      subscription: this.mainEmitter.changed(listener),
      funnel: this,
    });

    this.subscriptions[subscription.id] = subscription;

    return subscription;
  }

  removeSubscription(subscription) {
    delete this.subscriptions[subscription.id];
    if (!this.subscriptionsCount()) this.clearMainSubscriptions();
  }

  subscriptionsCount() {
    return Object.keys(this.subscriptions).length;
  }

  changed(listener) {
    if (!this.subscriptionsCount()) this.createMainSubscriptions();

    return this.addSubscription(listener);
  }

  emitChange(event = {}) {
    const broadcast = Object.assign({eventId: ulid()}, event);

    return this.emitters.map(emitter => emitter.emitChange(broadcast));
  }

}

const createChangesEmitter = () => new ChangesEmitter();
const createChangesFunnelEmitter = opts => new ChangesFunnelEmitter(opts);

module.exports = {
  ChangesEmitter,
  ChangesFunnelEmitter,
  createChangesEmitter,
  createChangesFunnelEmitter,
};
