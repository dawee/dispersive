const assert = require('assert');
const {expect} = require('chai');
const sinon = require('sinon');
const {ActionTree, Action} = require('./dispersive');


describe('Action', () => {

  it('should trigger asynchronously', (done) => {
    const listener = (data) => {
      assert.equal(42, data.value);
      done();
    };

    const action = Action.create((value) => new Promise(resolve => resolve({value})));

    action.subscribe(listener);
    action(42);
  });

  it('should be able to be unsubscribed', done => {
    const listener = sinon.spy();
    const action = Action.create(() => ({}));
    const subscription = action.subscribe(listener);

    subscription.remove();

    action().then(() => setTimeout(() => {
      assert(!listener.called);
      done();
    }, 0));
  });

  it('should be able to return an empty array', (done) => {
    const listener = (data) => {
      assert(Array.isArray(data));
      done();
    };

    const action = Action.create(() => {
      return [];
    });

    action.subscribe(listener);
    action();
  });

  it('should chain actions', (done) => {
    const listener1 = sinon.spy();
    const listener2 = sinon.spy();

    const listener = (data) => {
      assert(listener1.called);
      assert(listener2.called);
      done();
    };

    const action1 = Action.create((value) => new Promise(resolve => resolve({value})));
    const action2 = Action.create((value) => new Promise(resolve => resolve({value})));
    const grouped = Action.create((value) => action1(value).then(() => action2(value)));

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

    const action = Action.create((value) => new Promise((resolve, reject) => reject({value})));

    action.error.subscribe(listener);
    action(42);
  });

  it('should be able to call another action type', () => {
    const check = sinon.spy();

    class CustomAction extends Action {

      callHandler(...argv) {
        check();
        super.callHandler(...argv);
      }
    }

    const action1 = Action.create(value => {value}, {type: CustomAction});

    action1();
    assert(check.called);
  });

  it('should call action.before then the specified handler', done => {
    const checkHandler = sinon.spy();
    const action1 = Action.create(value => {value});

    action1.before.subscribe(() => {
      assert(!checkHandler.called);
      done();
    });

    action1.subscribe(checkHandler);
    action1();
  });

  it('should trigger before the promise resolution (#38)', done => {
    const subscriptionSpy = sinon.spy();
    const resolutionSpy = sinon.spy();
    const action = Action.create(() => new Promise(resolve => setTimeout(resolve, 10)));

    action.subscribe(() => {
      assert(!resolutionSpy.called);
      subscriptionSpy()
    });

    action().then(() => {
      resolutionSpy();
      assert(subscriptionSpy.called);
      done();
    });
  });

  describe('Tree', () => {

    it('should add action from handler', done => {
      const product = new ActionTree();

      const add = (name) => ({name});

      product.register('add', add);
      product.add.subscribe(() => done());
      product.add('something');
    });

    it('should add action tree', () => {
      const actions = new ActionTree();
      const product = new ActionTree();

      const add = (name) => ({name});

      actions.register('product', product);
      product.register('add', add);

      assert.deepEqual(['product.add'], actions.tree);
    });

    it('should add handlers with short-hand object', () => {
      const actions = new ActionTree();
      const product = new ActionTree();

      const add = (name) => ({name});

      actions.register({product});
      product.register({add});

      assert.deepEqual(['product.add'], actions.tree);
    });

    it('should add handlers from constructor', () => {
      const actions = new ActionTree({

        product: new ActionTree({
          add(name) {
            return {name};
          }
        }),

      });

      assert.deepEqual(['product.add'], actions.tree);
    });

    it('should add actions or handlers with short-hand object', () => {
      const actions = new ActionTree();
      const product = new ActionTree();

      const add = (name) => ({name});
      const sub = Action.create((name) => ({name}));

      actions.register({product});
      product.register({add, sub});

      assert.deepEqual(actions.tree, ['product.add', 'product.sub']);
    });

  })
})
