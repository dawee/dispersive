const Immutable = require('immutable');
const {QuerySet} = require('./queryset');
const {createObjectManagerConstructor} = require('./manager');
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

  assign(rawValues = {}) {
    Object.assign(this, rawValues);
  }

  get pk() {
    const pkName = this.setup.get('primaryKeyName');
    return this.values.get(pkName);
  }

  save() {
    this.values = this.manager.sync(this.values);
    return this;
  }

  update(rawValues = {}) {
    this.assign(rawValues);
    return this.save();
  }

}


const defaultSetup = {
  EntryConstructor: Entry,
  QuerySetConstructor: QuerySet,
  primaryKeyName: PRIMARY_KEY_NAME,
};


/*
 * Composition
 */


const applyMixin = ({name, setup, mixin}) => mixin({Base: setup.get(name), setup}, {setup});

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
const createQuerySetMixin = mixin => createMixin({name: 'QuerySetConstructor', mixin});

const createModel = (composers) => {
  const model = {};

  model.setup = composeSetup({
    setup: Immutable.Map(defaultSetup).set('model', model),
    composers: Array.isArray(composers) ? composers : [composers],
  });

  model.inject = (composer) => {
    model.setup = composer({setup: model.setup});
    model.objects = model.objects.useSetup(model.setup);
  };

  const QuerySetConstructor = model.setup.get('QuerySetConstructor');
  const ObjectManagerConstructor = createObjectManagerConstructor(QuerySetConstructor);

  model.emitter = createChangesEmitter();
  model.objects = new ObjectManagerConstructor(model);

  return model;
};

const mixModelComposers = (composers = []) => (
  ({setup}) => composeSetup({setup, composers})
);

module.exports = {
  createEntryMixin,
  createQuerySetMixin,
  createModel,
  mixModelComposers,
};
