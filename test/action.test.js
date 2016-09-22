const assert = require('assert');
const sinon = require('sinon');
const Dispersive = require('..');


describe('Action', () => {

  it('should trigger asynchronously', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };

    const action = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    action.subscribe(listener);
    action(42);
  });

  it('should chain actions', (done) => {
    const listener1 = sinon.spy();
    const listener2 = sinon.spy();

    const listener = (data) => {
      assert(listener1.called);
      assert(listener2.called);
      done();
    };

    const action1 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    const action2 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    const grouped = Dispersive.createAction((value) => (
      Dispersive.createActionGroup()
        .chain(action1, [value])
        .chain(action2, [value])
    ));

    action1.subscribe(listener1);
    action2.subscribe(listener2);
    grouped.subscribe(listener);
    grouped(42);
  });

  it('should trigger action.error when action failed', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };    

    const action = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => reject({value}))
    );

    action.error.subscribe(listener);
    action(42);
  });

  it('should trigger action.error when any of the grouped action failed', (done) => {
    const listener1 = sinon.spy();
    const listener2 = sinon.spy();

    const listener = (data) => {
      assert(!listener1.called);
      assert(!listener2.called);
      done();
    };

    const action1 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => reject({value}))
    );

    const action2 = Dispersive.createAction(
      (value) => new Promise((resolve, reject) => resolve({value}))
    );

    const grouped = Dispersive.createAction((value) => (
      Dispersive.createActionGroup()
        .chain(action1, [value])
        .chain(action2, [value])
    ));

    action1.subscribe(listener1);
    action2.subscribe(listener2);
    grouped.error.subscribe(listener);
    grouped(42);
  });
})