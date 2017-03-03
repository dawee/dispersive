const modules = require('./modules');

const applySubModule = subModule => (
  typeof subModule === 'object' ? mapSubModules(subModule) : require(subModule)
)

const mapSubModules = (subModules) => {
  const mapping = {};

  Object.keys(subModules).forEach((key) => {
    if (key === 'index') return Object.assign(mapping, applySubModule(subModules[key]));

    mapping[key] = applySubModule(subModules[key]);
  });

  return mapping;
};


module.exports = mapSubModules(modules);
