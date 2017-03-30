const { expect, assert } = require('chai');
const { OneToOneMapping } = require('../src/mapping');



describe('mapping', () => {

  it('should attach keys one-to-one', () => {
    const mapping = new OneToOneMapping();

    mapping.attach('foo', 'bar');

    expect(mapping.get('foo')).to.equals('bar');
    expect(mapping.reverse().get('bar')).to.equals('foo');
  });

})
