const assert = require('assert');
const Action = require('../action');
const Store = require('../store');

const testAction = Action.create();
const testAsyncAction = Action.createAsync((trigger) => trigger());

class TestStore extends Store {

  constructor() {
    super();
    this.bindAction(testAction, this.onTriggered);
    this.bindAction(testAsyncAction, this.onTriggered);
  }

  onTriggered() {
    this.emit('change');
  }

}

describe('Store', () => {
  it('actions should be triggered', () => {
    let count1 = 0;
    let count2 = 0;
    let store1 = new TestStore();
    let store2 = new TestStore();

    store1.on('change', () => count1++);
    store2.on('change', () => count2++);

    testAction();
    testAsyncAction();
    
    assert.equal(2, count1);
    assert.equal(2, count2);
  });

  it('should get entries by id', () => {
    let value = {id: 42, text: 'foobar'};
    let store = new TestStore();

    store.objects.create(value);
    assert.equal(value, store.objects.get({id: 42}));
  });

})