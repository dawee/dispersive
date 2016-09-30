const assert = require('assert');
const sinon = require('sinon');
const {pick, omit} = require('../lib/object');


describe('Object utils', () => {

  it('should pick only given keys', () => {
    assert.deepEqual({name: 'joe'}, pick({name: 'joe', age: '40'}, 'name'));
  });

  it('should omit given keys', () => {
    assert.deepEqual({name: 'joe'}, omit({name: 'joe', age: '40'}, 'age'));
  });


});