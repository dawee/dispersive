const Immutable = require('immutable');
const {createObjects} = require('./manager');
const {createChangesEmitter} = require('./emitter');

const ID_KEY = '_id';

/*
 * Constructor and prototype for default entries
 */

class ModelEntry {

  constructor({objects, values}) {
    this.objects = objects;
    this.values = values;
  }

  save() {
    this.values = this.objects.sync(this);
  }

}

const createEntry = ({objects, values, EntryConstructor}) => (
  new EntryConstructor({objects, values})
);

const composeSetup = ({setup, composers}) => {
  if (composers.count() === 0) return setup;

  const composer = composers.get(0);

  return composeSetup({setup: composer({setup}), composers: composers.shift(0)});
};

const applyExtension = ({setup, extension}) => extension(setup.get('EntryConstructor'));

const createInjector = extension => ({setup}) => (
  setup.set('EntryConstructor', applyExtension({setup, extension}))
);

const modelFactory = ({setup}) => {
  const emitter = setup.get('emitterFactory')();
  const objects = setup.get('objectsFactory')({emitter, setup});
  const inject = injector => objects.useSetup(injector({setup}));

  return {emitter, objects, inject};
};


/*
 * Default composers
 */

const addIdKey = ({setup}) => setup.set('idKey', ID_KEY);
const addObjectsFactory = ({setup}) => setup.set('objectsFactory', createObjects);
const addEmitterFactory = ({setup}) => setup.set('emitterFactory', createChangesEmitter);
const addEntryFactory = ({setup}) => setup.set('entryFactory', createEntry);

const addEntryConstructor = ({setup}) => setup.set('EntryConstructor', (
  class extends ModelEntry {}
));

const addModelFactory = ({setup}) => setup.set('modelFactory', modelFactory);

/*
 * Model creation
 */

const createModelSetup = ({composers}) => composeSetup({
  composers: Immutable.List.of(...composers),
  setup: Immutable.Map(),
});

const createModel = (...composers) => {
  const setup = createModelSetup({
    composers: [
      addIdKey,
      addObjectsFactory,
      addEmitterFactory,
      addEntryFactory,
      addEntryConstructor,
      addModelFactory,
      ...composers,
    ],
  });

  return setup.get('modelFactory')({setup});
};


module.exports = {
  createInjector,
  composeSetup,
  createModelSetup,
  createModel,
};
