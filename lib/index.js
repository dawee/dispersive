const Dispersive = module.exports = {};

Dispersive.Action = require('./action');
Dispersive.Dispatcher = require('./dispatcher');
Dispersive.EventEmitter = require('./emitter');
Dispersive.ObjectManager = require('./manager');
Dispersive.Model = require('./model');
Dispersive.Queryset = require('./queryset');
Dispersive.Schema = require('./schema');
Dispersive.Component = require('./component');

const {ListStateField, UniqueStateField, CountStateField} = Dispersive.Component;

Object.assign(Dispersive, {ListStateField, UniqueStateField, CountStateField});

Dispersive.createAction = Dispersive.Action.create;
Dispersive.usingEventFunnel = Dispersive.EventEmitter.Funnel.using;
