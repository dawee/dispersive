const { expect, assert } = require('chai');
const {
  OneToOneMapping,
  OneToManyMapping,
  ManyToOneMapping,
  ManyToManyMapping,
} = require('../src/mapping');



describe('mapping', () => {

  describe('one-to-one', () => {

    it('should attach keys', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');

      expect(mapping.get('foo')).to.equals('bar');
      expect(mapping.reversed.get('bar')).to.equals('foo');
    });

    it('should attach keys from reversed', () => {
      const mapping = new OneToOneMapping();

      mapping.reversed.attach('bar', 'foo');

      expect(mapping.get('foo')).to.equals('bar');
      expect(mapping.reversed.get('bar')).to.equals('foo');
    });

    it('should detach keys', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.detach('foo', 'bar');

      assert(!mapping.get('foo'));
      assert(!mapping.reversed.get('bar'));
    });

    it('should detach using source key only', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.detach('foo');

      assert(!mapping.get('foo'));
      assert(!mapping.reversed.get('bar'));
    });

    it('should detach using dest key only', () => {
      const mapping = new OneToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.reversed.detach('bar');

      assert(!mapping.get('foo'));
      assert(!mapping.reversed.get('bar'));
    });

  });

  describe('one-to-many', () => {

    it('should attach keys', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.get('baz')).to.equals('foo');
      expect(mapping.reversed.get('foo').toJS()).to.deep.equals(['bar', 'baz']);
    });

    it('should update keyset when changing unique key', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      mapping.attach('baz', 'woo');

      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.get('baz')).to.equals('woo');
      expect(mapping.reversed.get('foo').toJS()).to.deep.equals(['bar']);
    });

    it('should detach from unique key', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      mapping.detach('baz');

      assert(!mapping.get('baz'));
      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.reversed.get('foo').toJS()).to.deep.equals(['bar']);
    });

    it('should detach from reverse set', () => {
      const mapping = new OneToManyMapping();

      mapping.attach('bar', 'foo');
      mapping.attach('baz', 'foo');

      mapping.reversed.detach('foo', 'baz');

      assert(!mapping.get('baz'));
      expect(mapping.get('bar')).to.equals('foo');
      expect(mapping.reversed.get('foo').toJS()).to.deep.equals(['bar']);
    });

  });

  describe('many-to-one', () => {

    it('should attach keys', () => {
      const mapping = new ManyToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.attach('foo', 'baz');

      expect(mapping.get('foo').toJS()).to.deep.equals(['bar', 'baz']);
      expect(mapping.reversed.get('bar')).to.equals('foo');
      expect(mapping.reversed.get('baz')).to.equals('foo');
    });

    it('should detach keys', () => {
      const mapping = new ManyToOneMapping();

      mapping.attach('foo', 'bar');
      mapping.attach('foo', 'baz');

      mapping.detach('foo', 'baz');

      expect(mapping.get('foo').toJS()).to.deep.equals(['bar']);
      expect(mapping.reversed.get('bar')).to.equals('foo');
      assert(!mapping.reversed.get('baz'));
    });
  });

  describe('many-to-many', () => {

    it('should attach keys', () => {
      const mapping = new ManyToManyMapping();

      mapping.attach('foo', 'bar');
      mapping.attach('foo', 'baz');
      mapping.attach('bar', 'baz');

      expect(mapping.get('foo').toJS()).to.deep.equals(['bar', 'baz']);
      expect(mapping.reversed.get('bar').toJS()).to.deep.equals(['foo']);
      expect(mapping.reversed.get('baz').toJS()).to.deep.equals(['foo', 'bar']);
    });

    it('should detach keys', () => {
      const mapping = new ManyToManyMapping();

      mapping.attach('foo', 'bar');
      mapping.attach('foo', 'baz');
      mapping.attach('bar', 'baz');

      mapping.detach('bar', 'baz');

      expect(mapping.get('foo').toJS()).to.deep.equals(['bar', 'baz']);
      expect(mapping.reversed.get('bar').toJS()).to.deep.equals(['foo']);
      expect(mapping.reversed.get('baz').toJS()).to.deep.equals(['foo']);
    });

    it('should detach keys from reversed', () => {
      const mapping = new ManyToManyMapping();

      mapping.attach('foo', 'bar');
      mapping.attach('foo', 'baz');
      mapping.attach('bar', 'baz');

      mapping.reversed.detach('baz', 'bar');

      expect(mapping.get('foo').toJS()).to.deep.equals(['bar', 'baz']);
      expect(mapping.reversed.get('bar').toJS()).to.deep.equals(['foo']);
      expect(mapping.reversed.get('baz').toJS()).to.deep.equals(['foo']);
    });
  });
})
