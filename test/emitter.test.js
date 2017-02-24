const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {emitter, error} = require('..');


describe('emitter', () => {

  it('should propagate changes', () => {
    const changesEmitter = emitter.createChangesEmitter();
    const listener = spy();

    changesEmitter.changed(listener);
    changesEmitter.emitChange({foo: 42});

    assert(listener.called);
    assert(listener.calledWith({foo: 42}))
  });

  it('should remove subscriptions', () => {
    const changesEmitter = emitter.createChangesEmitter();
    const listener = spy();
    const subscription = changesEmitter.changed(listener);

    subscription.remove();
    changesEmitter.emitChange({foo: 42});

    expect(listener.called).to.equal(false);
  });

})
