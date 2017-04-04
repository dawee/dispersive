const { createEntryMixin } = require('./model');


const withField = (name, opts = { initial: null }) => (
  createEntryMixin(({ Base }) => class extends Base {

    constructor(...args) {
      super(...args);

      if (!this.values.has(name)) {
        this.values = this.values.set(name, opts.initial);
      }

      Object.defineProperty(this, name, {
        enumerable: true,
        get: () => this.values.get(name),
        set: (value) => {
          this.values = this.values.set(name, value);
        },
      });
    }

  })
);

module.exports = {
  withField,
};
