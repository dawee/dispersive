const {assert, expect} = require('chai');
const {spy} = require('sinon');
const {createChangesEmitter, createChangesFunnelEmitter} = require('../src/emitter');
const error = require('../src/error');


describe('emitter', () => {

  it('should propagate changes', () => {
    const changesEmitter = createChangesEmitter();
    const listener = spy();

    changesEmitter.changed(listener);
    changesEmitter.emitChange({foo: 42});

    assert(listener.called);
    assert(listener.calledWith({foo: 42}))
  });

  it('should remove subscriptions', () => {
    const changesEmitter = createChangesEmitter();
    const listener = spy();
    const subscription = changesEmitter.changed(listener);

    subscription.remove();
    changesEmitter.emitChange({foo: 42});

    expect(listener.called).to.equal(false);
  });

})

describe('funnel', () => {

  it('should emit change on each emitters', () => {
    const emitter1 = createChangesEmitter();
    const emitter2 = createChangesEmitter();
    const listener1 = spy();
    const listener2 = spy();

    emitter1.changed(listener1);
    emitter2.changed(listener2);

    createChangesFunnelEmitter({emitters: [emitter1, emitter2]}).emitChange();

    assert(listener1.calledOnce);
    assert(listener2.calledOnce);
  });

  it('should emit change on each sources', () => {
    const source1 = {emitter: createChangesEmitter()};
    const source2 = {emitter: createChangesEmitter()};
    const listener1 = spy();
    const listener2 = spy();

    source1.emitter.changed(listener1);
    source2.emitter.changed(listener2);

    createChangesFunnelEmitter({sources: [source1, source2]}).emitChange();

    assert(listener1.calledOnce);
    assert(listener2.calledOnce);
  });

  it('should receive changes once', () => {
    const source1 = {emitter: createChangesEmitter()};
    const source2 = {emitter: createChangesEmitter()};
    const funnel = createChangesFunnelEmitter({sources: [source1, source2]});
    const listener1 = spy();
    const listener2 = spy();

    funnel.changed(listener1);
    funnel.changed(listener2);

    createChangesFunnelEmitter({sources: [source1, source2]}).emitChange();

    assert(listener1.calledOnce);
    assert(listener2.calledOnce);
  });

  it('should work with different set of sources (3 for 2)', () => {
    const source1 = {emitter: createChangesEmitter()};
    const source2 = {emitter: createChangesEmitter()};
    const source3 = {emitter: createChangesEmitter()};
    const funnel = createChangesFunnelEmitter({sources: [source1, source2, source3]});
    const listener1 = spy();
    const listener2 = spy();

    funnel.changed(listener1);
    funnel.changed(listener2);

    createChangesFunnelEmitter({sources: [source1, source2]}).emitChange();

    assert(listener1.calledOnce);
    assert(listener2.calledOnce);
  });

  it('should work with different set of sources (2 for 3)', () => {
    const source1 = {emitter: createChangesEmitter()};
    const source2 = {emitter: createChangesEmitter()};
    const source3 = {emitter: createChangesEmitter()};
    const funnel = createChangesFunnelEmitter({sources: [source1, source2]});
    const listener1 = spy();
    const listener2 = spy();

    funnel.changed(listener1);
    funnel.changed(listener2);

    createChangesFunnelEmitter({sources: [source1, source2, source3]}).emitChange();

    assert(listener1.calledOnce);
    assert(listener2.calledOnce);
  });

  it('should be able to remove subscription', () => {
    const source1 = {emitter: createChangesEmitter()};
    const source2 = {emitter: createChangesEmitter()};
    const funnel = createChangesFunnelEmitter({sources: [source1, source2]});
    const listener1 = spy();
    const listener2 = spy();

    const subscription1 = funnel.changed(listener1);
    const subscription2 = funnel.changed(listener2);

    subscription1.remove();
    subscription2.remove();

    createChangesFunnelEmitter({sources: [source1, source2]}).emitChange();

    assert(!listener1.called);
    assert(!listener2.called);
    expect(funnel.subscriptionsCount()).to.equal(0);
  });

});
