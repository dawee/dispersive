const withField = (name, options = {}) => (
  ({setup}) => {
    const EntryConstructor = setup.get('EntryConstructor');
    const ExtendedConstructor = class extends EntryConstructor {

      constructor(...args) {
        super(...args);

        if ('initial' in options) this[name] = options.initial;
      }

    };

    return setup.set('EntryConstructor', ExtendedConstructor);
  }
);

module.exports = {
  withField,
};
