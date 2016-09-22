const assert = require('assert');
const sinon = require('sinon');
const {createAction} = require('..');


describe('Action', () => {

  it('should trigger asynchronously', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };

    const action = createAction((value) => new Promise(resolve => resolve({value})));

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

    const action1 = createAction((value) => new Promise(resolve => resolve({value})));
    const action2 = createAction((value) => new Promise(resolve => resolve({value})));
    const grouped = createAction((value) => action1(value).then(() => action2(value)));

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

    const action = createAction((value) => new Promise((resolve, reject) => reject({value})));

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

    const action1 = createAction((value) => new Promise((resolve, reject) => reject({value})));
    const action2 = createAction((value) => new Promise(resolve => resolve({value})));
    const grouped = createAction((value) => action1(value).then(() => action2(value)));

    action1.subscribe(listener1);
    action2.subscribe(listener2);
    grouped.error.subscribe(listener);
    grouped(42);
  });
})