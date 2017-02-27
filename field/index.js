const extendWithField = (EntryConstructor, field) => (
  class extends EntryConstructor {

    constructor(...args) {
      super(...args);
      this[field.name] = field.init ? field.init({entry: this, args}) : null;
    }

    set [field.name](value) {
      this.values = field.set ? field.set({entry: this, set: super.set, value}) : null;
    }

    get [field.name]() {
      return field.get ? field.get({entry: this, get: super.get}) : null;
    }

  }
);

const withField = (name, options = {}) => (
  ({setup}) => (
    setup.set('EntryConstructor', extendWithField(setup.get('EntryConstructor'), {
      name,
      init: () => options.initial,
      set: ({entry, value}) => entry.values.set(name, value),
      get: ({entry}) => entry.values.get(name),
    }))
  )
);

module.exports = {
  extendWithField,
  withField,
};
