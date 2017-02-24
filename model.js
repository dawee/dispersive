const Immutable = require('immutable');
const {createObjects} = require('./manager');
const {createChangesEmitter} = require('./emitter');

/*
 * Constructor and prototype for default entries
 */

class ModelEntry {

  constructor({manager, values}) {
    this.manager = manager;
    this.values = values;
  }

  save() {
    this.values = this.manager.sync(this);
  }

}

/*
 * Default composers
 */

const modelFactory = ({model, manager, values}) => new model.constructor({manager, values});
const addObjects = ({model}) => model.set('objects', createObjects({model}));
const addEmitter = ({model}) => model.set('emitter', createChangesEmitter());
const addFactory = ({model}) => model.set('factory', modelFactory);
const addConstructor = ({model}) => model.set('constructor', ModelEntry);

/*
 * Model creation
 */

const composeModel = ({model, composers}) => {
  if (composers.count() === 0) return model;

  const composer = composers.get(0);

  return composeModel({model: composer({model}), composers: composers.shift(0)});
};

const generateCreateModel = ({composers}) => composeModel({
  model: Immutable.Map(),
  composers: Immutable.List.of(...composers),
}).toJS();

const createDefaultComposers = () => ([
  addObjects,
  addEmitter,
  addConstructor,
  addFactory,
]);

const createModel = (...composers) => generateCreateModel({
  composers: createDefaultComposers().concat(composers),
});


module.exports = {
  addEmitter,
  addObjects,
  composeModel,
  generateCreateModel,
  createModel,
};
