const assert = require('assert');
const Action = require('../action');
const Store = require('../store');

const testAction = Action.create();
const testAsyncAction = Action.createAsync((trigger) => trigger());

class TestStore extends Store {

  static bindActions() {
    this.bindAction(testAction, this.onTriggered);
    this.bindAction(testAsyncAction, this.onTriggered);
  }

  static onTriggered() {
    this.trigger('change');
  }

}

TestStore.initialize();

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

    TestStore.objects.create(value);
    assert.equal(value, TestStore.objects.get({id: 42}));
  });

})