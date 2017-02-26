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

const modelFactory = ({setup}) => {
  const emitter = setup.get('emitterFactory')();
  const objects = setup.get('objectsFactory')({emitter, setup});

  return {emitter, objects};
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

const composeModel = ({setup, composers}) => {
  if (composers.count() === 0) return setup;

  const composer = composers.get(0);

  return composeModel({setup: composer({setup}), composers: composers.shift(0)});
};

const createModelSetup = ({composers}) => composeModel({
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
  composeModel,
  createModelSetup,
  createModel,
};
