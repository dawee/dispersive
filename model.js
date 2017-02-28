const Immutable = require('immutable');
const {ObjectManager} = require('./manager');
const {createChangesEmitter} = require('./emitter');

const ID_KEY = '_id';

/*
 * Constructor and prototype for default entries
 */

class Entry {

  constructor({objects, values}) {
    this.objects = objects;
    this.values = values;
  }

  save() {
    this.values = this.objects.sync(this);
  }

}

class Model {

  constructor({setup}) {
    const ObjectManagerConstructor = setup.get('ObjectManagerConstructor');
    const emitter = createChangesEmitter();
    const objects = new ObjectManagerConstructor({emitter, setup});

    Object.assign(this, {setup, emitter, objects});
  }

  inject(composer) {
    this.setup = composer({setup: this.setup});
    this.objects.useSetup(this.setup);
  }

}

const composeSetup = ({setup, composers}) => {
  const composer = composers.get(0);

  return composer ? composeSetup({
    setup: composer({setup}),
    composers: composers.shift(0),
  }) : setup;
};

const applyMixin = ({name, setup, mixin}) => mixin(setup.get(name));

const createMixin = ({name, mixin}) => (
  ({setup}) => setup.set(name, applyMixin({name, setup, mixin}))
);

const createEntryMixin = mixin => createMixin({name: 'EntryConstructor', mixin});
const createObjectManagerMixin = mixin => createMixin({name: 'ObjectManagerConstructor', mixin});

/*
 * Default composers
 */

const addIdKey = ({setup}) => setup.set('idKey', ID_KEY);

/*
 * Model creation
 */

const createModelSetup = ({composers}) => composeSetup({
  composers: Immutable.List.of(...composers),
  setup: Immutable.Map({
    EntryConstructor: Entry,
    ObjectManagerConstructor: ObjectManager,
  }),
});

const createModel = (composers = []) => {
  const setup = createModelSetup({
    composers: [
      addIdKey,
      ...composers,
    ],
  });

  return new Model({setup});
};


module.exports = {
  createEntryMixin,
  createObjectManagerMixin,
  createModel,
};
