const Immutable = require('immutable');
const ulid = require('ulid');
const assert = require('assert');
const { QuerySet } = require('./queryset');
const { createObjectManagerConstructor } = require('./manager');
const { createChangesEmitter } = require('./emitter');
const { Transaction } = require('./transaction');

/*
 * Default setup
 */

const PRIMARY_KEY_NAME = 'key';


class Entry {

  constructor({ values, setup, manager }) {
    this.values = values;
    this.setup = setup;
    this.manager = manager;

    Object.defineProperty(this, setup.get('keyName'), {
      enumerable: true,
      get: () => this.getKey(),
    });
  }

  getKey() {
    return this.values.get(this.setup.get('keyName'));
  }

  assign(rawValues = {}) {
    Object.assign(this, rawValues);
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

  equals({ values }) {
    return this.values === values;
  }

}

const createObjectsConstructor = ({ setup }) => {
  const QuerySetConstructor = setup.get('QuerySetConstructor');
  return createObjectManagerConstructor(QuerySetConstructor);
};


const defaultSetup = {
  EntryConstructor: Entry,
  QuerySetConstructor: QuerySet,
  objectsConstructorFactory: createObjectsConstructor,
  keyName: PRIMARY_KEY_NAME,
};


/*
 * Composition
 */


const applyMixin = ({ name, setup, model, mixin }) => mixin({ Base: setup.get(name), setup, model });

const createMixin = ({ name, mixin }) => (
  ({ setup, model }) => setup.set(name, applyMixin({ name, setup, model, mixin }))
);

const composeSetup = ({ model, setup = Immutable.Map(defaultSetup), composers = [] }) => {
  const composer = Immutable.List(composers).get(0);

  return composer ? composeSetup({
    model,
    setup: composer({ model, setup }),
    composers: Immutable.List(composers).shift(0),
  }) : setup;
};


/*
 * API
 */

const createEntryMixin = mixin => createMixin({ name: 'EntryConstructor', mixin });
const createQuerySetMixin = mixin => createMixin({ name: 'QuerySetConstructor', mixin });
const createObjectManagerMixin = mixin => (
  ({ setup }) => {
    const parentFactory = setup.get('objectsConstructorFactory');

    return setup.set('objectsConstructorFactory', ({ newSetup = setup, model }) => (
      mixin({ Base: parentFactory({ setup: newSetup }), setup: newSetup, model })
    ));
  }
);

const normalizeComposers = (composers = []) => (
  Immutable.List(Array.isArray(composers) ? composers : [composers])
);

const createModel = (composers) => {
  const emitter = createChangesEmitter();
  const model = { emitter, id: ulid() };

  let ObjectManagerConstructor = null;
  let transaction = null;
  let values = Immutable.OrderedMap();
  let setup = composeSetup({
    model,
    setup: Immutable.Map(defaultSetup),
    composers: normalizeComposers(composers),
  });

  const resetObjectsConstructor = () => setup.get('objectsConstructorFactory')({ setup, model });

  ObjectManagerConstructor = resetObjectsConstructor();

  model.inject = (injected) => {
    setup = composeSetup({
      model,
      setup,
      composers: normalizeComposers(injected),
    });

    ObjectManagerConstructor = resetObjectsConstructor();
  };

  model.createTransaction = () => {
    assert.ok(!transaction);

    transaction = new Transaction({ values, setup });
  };

  model.commitTransaction = () => {
    assert.ok(transaction);

    values = transaction.values;
    transaction = null;
  };

  model.abortTransaction = () => {
    transaction = null;
  };

  Object.defineProperty(model, 'objects', {
    get() {

      return new ObjectManagerConstructor({ setup, values, transaction });
    },
  });

  return model;
};

const mix = (composers = []) => (
  ({ setup }) => composeSetup({ setup, composers })
);

module.exports = {
  Entry,
  createEntryMixin,
  createQuerySetMixin,
  createObjectManagerMixin,
  createModel,
  mix,
};
