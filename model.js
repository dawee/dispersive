const Immutable = require('immutable');
const assert = require('./assert');
const {QuerySet} = require('./queryset');
const {createObjectManager} = require('./manager');
const {createChangesEmitter} = require('./emitter');

/*
 * Default setup
 */

const PRIMARY_KEY_NAME = '_pk';


class Entry {

  constructor({manager, values, setup}) {
    this.manager = manager;
    this.values = values;
    this.setup = setup;
  }

  get pk() {
    const pkName = this.setup.get('primaryKeyName');
    return this.values.get(pkName);
  }

  save() {
    this.values = this.manager.sync(this.values);
    return this;
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
  ObjectManagerConstructor: createObjectManager(QuerySet),
  EntryConstructor: Entry,
  primaryKeyName: PRIMARY_KEY_NAME,
};


/*
 * Composition
 */


const applyMixin = ({name, setup, mixin}) => mixin(setup.get(name), {setup});

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
