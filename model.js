const Immutable = require('immutable');
const {createObjects} = require('./manager');
const {createChangesEmitter} = require('./emitter');

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

const createEntry = ({objects, values}) => new ModelEntry({objects, values});

/*
 * Default composers
 */

const addObjectsFactory = ({setup}) => setup.set('objectsFactory', createObjects);
const addEmitterFactory = ({setup}) => setup.set('emitterFactory', createChangesEmitter);
const addEntryFactory = ({setup}) => setup.set('entryFactory', createEntry);
const addModelFactory = ({setup}) => setup.set('modelFactory', ({fixedSetup}) => {
  const emitter = fixedSetup.emitterFactory();
  const objects = fixedSetup.objectsFactory({emitter, entryFactory: fixedSetup.entryFactory});

  return {emitter, objects};
});

/*
 * Model creation
 */

const composeModel = ({setup, composers}) => {
  if (composers.count() === 0) return setup;

  const composer = composers.get(0);

  return composeModel({setup: composer({setup}), composers: composers.shift(0)});
};

const generateCreateModel = ({composers}) => composeModel({
  setup: Immutable.Map(),
  composers: Immutable.List.of(...composers),
}).toJS();

const createModel = (...composers) => {
  const fixedSetup = generateCreateModel({
    composers: [
      addObjectsFactory,
      addEmitterFactory,
      addEntryFactory,
      addModelFactory,
      ...composers,
    ],
  });

  return fixedSetup.modelFactory({fixedSetup});
};


module.exports = {
  composeModel,
  generateCreateModel,
  createModel,
};
