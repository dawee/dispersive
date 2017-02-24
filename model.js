const Immutable = require('immutable');
const {createObjects} = require('./manager');
const {createChangesEmitter} = require('./emitter');

/*
 * Default composers
 */

const addObjects = ({model}) => model.set('objects', createObjects());
const addEmitter = ({model}) => model.set('emitter', createChangesEmitter());


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

const createModel = (...composers) => generateCreateModel({
  composers: [addObjects, addEmitter].concat(composers),
});


module.exports = {
  addEmitter,
  addObjects,
  composeModel,
  generateCreateModel,
  createModel,
};
