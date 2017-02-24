const Immutable = require('immutable');
const {createObjects} = require('./manager');
const {createChangesEmitter} = require('./emitter');


const composeModel = ({model, composers}) => {
  if (composers.count() === 0) return model;

  const composer = composers.get(0);

  return composeModel({model: composer({model}), composers: composers.shift(0)});
};


const addObjects = ({model}) => model.set('objects', createObjects());
const addEmitter = ({model}) => model.set('emitter', createChangesEmitter());

const defaultComposers = [addObjects, addEmitter];

const createModel = (...baseComposers) => {
  const composers = Immutable.List.of(...defaultComposers).concat(baseComposers);
  const model = composeModel({model: Immutable.Map(), composers});

  return model.toJS();
};


module.exports = {
  addEmitter,
  addObjects,
  composeModel,
  createModel,
  defaultComposers,
};
