const { expect, assert } = require('chai');
const { OneToOneMapping } = require('../src/mapping');



describe('mapping', () => {

  describe('one-to-one', () => {

    it('should attach keys', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');

      expect(mapping.get('foo')).to.equals('bar');
      expect(mapping.reverse().get('bar')).to.equals('foo');
    });

    it('should attach keys from reversed', () => {
      const mapping = new OneToOneMapping();

      mapping.reverse().attach('bar', 'foo');

      expect(mapping.get('foo')).to.equals('bar');
      expect(mapping.reverse().get('bar')).to.equals('foo');
    });

    it('should detach keys', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.detach('foo', 'bar');

      assert(!mapping.get('foo'));
      assert(!mapping.reverse().get('bar'));
    });

    it('should detach using source key only', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.detach('foo');

      assert(!mapping.get('foo'));
      assert(!mapping.reverse().get('bar'));
    });

    it('should detach using dest key only', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.reverse().detach('bar');

      assert(!mapping.get('foo'));
      assert(!mapping.reverse().get('bar'));
    });

  });


})
