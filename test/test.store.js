const assert = require('assert');
const Dispersive = require('..');

const testAction = Dispersive.Action.create();
const testAsyncAction = Dispersive.Action.createAsync((trigger) => trigger());

const TestStore = Dispersive.Store.create();

TestStore.triggerChange = (() => TestStore.emitter.trigger('change'));
TestStore.dispatcher.on(testAction, TestStore.triggerChange);
TestStore.dispatcher.on(testAsyncAction, TestStore.triggerChange);


describe('Store', () => {

  it('should get entries by id', () => {
    let value = {id: 42, text: 'foobar'};

    TestStore.objects.create(value);
    assert.equal(value, TestStore.objects.get({id: 42}));
  });

})