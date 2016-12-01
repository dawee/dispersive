const assert = require('assert');
const sinon = require('sinon');
const {ActionTree, Action, createAction} = require('./dispersive');


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

  it('should be able to call another action type', () => {
    const check = sinon.spy();

    class CustomAction extends Action {

      callHandler(...argv) {
        check();
        super.callHandler(...argv);
      }
    }

    const action1 = createAction(value => {value}, {type: CustomAction});

    action1();
    assert(check.called);
  });

  it('should call action.before then the specified handler', done => {
    const checkHandler = sinon.spy();
    const action1 = createAction(value => {value});

    action1.before.subscribe(() => {
      assert(!checkHandler.called);
      done();
    });

    action1.subscribe(checkHandler);
    action1();
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
      const sub = createAction((name) => ({name}));

      actions.register({product});
      product.register({add, sub});

      assert.deepEqual(actions.tree, ['product.add', 'product.sub']);
    });

  })
})