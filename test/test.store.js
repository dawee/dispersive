const assert = require('assert');
const Dispersive = require('..');

describe('Store', () => {

  let TestStore;

  beforeEach((done) => {
    TestStore = Dispersive.Store.create();
    done();
  });

  it('should get entries from manager', () => {
    let value = {id: 42, text: 'foobar'};

    TestStore.objects.create(value);
    assert.equal(value, TestStore.objects.get({id: 42}));
  });

  it('should trigger emitter events');
  it('should bind emitter events');
  it('should bind dispatcher events');

})