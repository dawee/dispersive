const Immutable = require('immutable');
const {ObjectManager} = require('./manager');
const {createChangesEmitter} = require('./emitter');

/*
 * Default setup
 */

const ID_KEY = '_id';


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
    this.objects = this.objects.useSetup(this.setup);
  }

}

const defaultSetup = {
  ObjectManagerConstructor: ObjectManager,
  EntryConstructor: Entry,
  idKey: ID_KEY,
};


/*
 * Mixins
 */

const applyMixin = ({name, setup, mixin}) => mixin(setup.get(name));

const createMixin = ({name, mixin}) => (
  ({setup}) => setup.set(name, applyMixin({name, setup, mixin}))
);

const createEntryMixin = mixin => createMixin({name: 'EntryConstructor', mixin});
const createObjectManagerMixin = mixin => createMixin({name: 'ObjectManagerConstructor', mixin});


/*
 * Model creation
 */

const composeSetup = ({setup, composers}) => {
  const composer = composers.get(0);

  return composer ? composeSetup({
    setup: composer({setup}),
    composers: composers.shift(0),
  }) : setup;
};

const createModelSetup = ({composers}) => composeSetup({
  composers: Immutable.List.of(...composers),
  setup: Immutable.Map(defaultSetup),
});

const createModel = (composers = []) => new Model({setup: createModelSetup({composers})});


module.exports = {
  createEntryMixin,
  createObjectManagerMixin,
  createModel,
};
