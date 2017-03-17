const {createEntryMixin, mix} = require('./model');

const usingFieldAccessors = (name, spec) => (
  createEntryMixin(({Base}) => {
    const EntryMixin = class extends Base {};

    Object.defineProperty(EntryMixin.prototype, name, Object.assign({
      enumerable: true,
    }, spec));

    return EntryMixin;
  })
);

const usingFieldInitial = (name, initial) => (
  createEntryMixin(({Base}) => class extends Base {
    constructor(...args) {
      super(...args);

      if (!this.values.has(name)) this[name] = initial;
    }
  })
);

const usingDefaultFieldAccessors = name => usingFieldAccessors(name, {
  get() {
    return this.values.get(name);
  },

  set(value) {
    this.values = this.values.set(name, value);
  },
});

const withInitializedField = (name, {initial = null}) => mix([
  usingFieldInitial(name, initial),
  usingDefaultFieldAccessors(name),
]);

const withField = (name, options = {}) => withInitializedField(name, options);

module.exports = {
  withField,
};
