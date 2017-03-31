const { expect, assert } = require('chai');
const { OneToOneMapping, OneToManyMapping } = require('../src/mapping');



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

  describe('one-to-many', () => {

    it('should attach keys', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.get('baz')).to.equals('foo');
      expect(mapping.reverse().get('foo').toJS()).to.deep.equals(['bar', 'baz']);
    });

    it('should update keyset when changing unique key', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      mapping.attach('baz', 'woo');

      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.get('baz')).to.equals('woo');
      expect(mapping.reverse().get('foo').toJS()).to.deep.equals(['bar']);
    });

    it('should detach from unique key', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      mapping.detach('baz');

      assert(!mapping.get('baz'));
      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.reverse().get('foo').toJS()).to.deep.equals(['bar']);
    });

    it('should detach from reverse set', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      mapping.reverse().detach('foo', 'baz');

      assert(!mapping.get('baz'));
      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.reverse().get('foo').toJS()).to.deep.equals(['bar']);
    });

  });

})
