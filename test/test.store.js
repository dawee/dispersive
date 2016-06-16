const assert = require('assert');
const Action = require('../action');
const Store = require('../store');

const testAction = Action.create();

class TestStore extends Store {

  constructor() {
    super();
    this.register(testAction, this.onTriggered);    
  }

  onTriggered() {
    this.emit('change');
  }

}

describe('Store', () => {
  it('should emit only once', () => {
    let count1 = 0;
    let count2 = 0;
    let store1 = new TestStore();
    let store2 = new TestStore();

    store1.on('change', () => count1++);
    store2.on('change', () => count2++);

    testAction();

    assert.equal(1, count1);
    assert.equal(1, count2);
  })
})