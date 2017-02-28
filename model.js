const Immutable = require('immutable');
const assert = require('./assert');
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
 * Composition
 */


const applyMixin = ({name, setup, mixin}) => mixin(setup.get(name));

const createMixin = ({name, mixin}) => (
  ({setup}) => setup.set(name, applyMixin({name, setup, mixin}))
);

const composeSetup = ({setup = Immutable.Map(defaultSetup), composers = []}) => {
  const composer = Immutable.List(composers).get(0);

  return composer ? composeSetup({
    setup: composer({setup}),
    composers: Immutable.List(composers).shift(0),
  }) : setup;
};


/*
 * API
 */

const createEntryMixin = mixin => createMixin({name: 'EntryConstructor', mixin});

const createObjectManagerMixin = mixin => createMixin({name: 'ObjectManagerConstructor', mixin});

const createModel = (composers = []) => {
  assert.composersAreArray(composers);

  return new Model({setup: composeSetup({composers})});
};

const mixModelComposers = (composers = []) => (
  ({setup}) => composeSetup({setup, composers})
);

module.exports = {
  createEntryMixin,
  createObjectManagerMixin,
  createModel,
  mixModelComposers,
};
