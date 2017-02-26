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

const modelFactory = ({model, manager, values}) => {
  const EntryConstructor = model.get('constructor');
  return new EntryConstructor({manager, values});
};

const addObjects = ({model}) => model.set('objects', createObjects({model}));
const addEmitter = ({model}) => model.set('emitter', createChangesEmitter());
const addFactory = ({model}) => model.set('factory', modelFactory);
const addConstructor = ({model}) => model.set('constructor', ModelEntry);

const preComposers = Immutable.List.of(addEmitter, addConstructor, addFactory);
const postComposers = Immutable.List.of(addObjects);
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
  composers,
}).toJS();

const createModel = (...composers) => generateCreateModel({
  composers: preComposers.concat(...composers).concat(postComposers),
});


module.exports = {
  addEmitter,
  addObjects,
  composeModel,
  generateCreateModel,
  createModel,
  preComposers,
  postComposers,
};
