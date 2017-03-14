const Immutable = require('immutable');
const ulid = require('ulid');
const {QuerySet} = require('./queryset');
const {createObjectManagerConstructor} = require('./manager');
const {createChangesEmitter} = require('./emitter');

/*
 * Default setup
 */

const PRIMARY_KEY_NAME = '_pk';


class Entry {

  constructor({values, setup, model}) {
    this.values = values;
    this.setup = setup;
    this.model = model;
  }

  get manager() {
    return this.model.objects;
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

  delete() {
    this.values = this.manager.unsync(this.values);
    return this;
  }

  toJSON() {
    return {};
  }

  equals({values}) {
    return this.values === values;
  }

}

const createObjectsConstructor = ({setup}) => {
  const QuerySetConstructor = setup.get('QuerySetConstructor');
  return createObjectManagerConstructor(QuerySetConstructor);
};


const defaultSetup = {
  EntryConstructor: Entry,
  QuerySetConstructor: QuerySet,
  objectsConstructorFactory: createObjectsConstructor,
  primaryKeyName: PRIMARY_KEY_NAME,
};


/*
 * Composition
 */


const applyMixin = ({name, setup, mixin}) => mixin({Base: setup.get(name), setup}, {setup});

const createMixin = ({name, mixin}) => (
  ({setup}) => setup.set(name, applyMixin({name, setup, mixin}))
);

const composeSetup = ({model, setup = Immutable.Map(defaultSetup), composers = []}) => {
  const composer = Immutable.List(composers).get(0);

  return composer ? composeSetup({
    model,
    setup: composer({model, setup}),
    composers: Immutable.List(composers).shift(0),
  }) : setup;
};


/*
 * API
 */

const createEntryMixin = mixin => createMixin({name: 'EntryConstructor', mixin});
const createQuerySetMixin = mixin => createMixin({name: 'QuerySetConstructor', mixin});
const createObjectManagerMixin = mixin => (
  ({setup}) => {
    const parentFactory = setup.get('objectsConstructorFactory');

    return setup.set('objectsConstructorFactory', ({newSetup = setup, model}) => (
      mixin({Base: parentFactory({setup: newSetup}), setup: newSetup, model})
    ));
  }
);

const createModel = (composers) => {
  const emitter = createChangesEmitter();
  const model = {emitter, id: ulid()};

  let objects = null;
  let setup = composeSetup({
    model,
    setup: Immutable.Map(defaultSetup),
    composers: Array.isArray(composers) ? composers : [composers],
  });

  model.inject = (injected) => {
    setup = composeSetup({
      model,
      setup,
      composers: Array.isArray(injected) ? injected : [injected],
    });
  };

  Object.defineProperty(model, 'objects', {
    get() {
      const opts = objects || {model, setup, emitter, values: Immutable.Map()};

      const objectsConstructorFactory = setup.get('objectsConstructorFactory');
      const ObjectManagerConstructor = objectsConstructorFactory({setup, model});

      objects = new ObjectManagerConstructor(opts);

      return objects;
    },
  });

  return model;
};

const mix = (composers = []) => (
  ({setup}) => composeSetup({setup, composers})
);

module.exports = {
  createEntryMixin,
  createQuerySetMixin,
  createObjectManagerMixin,
  createModel,
  mix,
};
