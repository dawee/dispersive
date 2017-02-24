const Immutable = require('immutable');
const {createObjects} = require('./manager');

const composeModel = ({model, composers}) => {
  if (composers.count() === 0) return model;

  const composer = composers.get(0);

  return composeModel({model: composer({model}), composers: composers.shift(0)});
};

const createModel = (...baseComposers) => {
  const composers = Immutable.List.of(...baseComposers);
  const model = composeModel({model: Immutable.Map(), composers});

  return model.toJS();
};

module.exports = {
  createModel,
};
