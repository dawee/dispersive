const Dispersive = module.exports = {};

Dispersive.Action = require('./action');
Dispersive.Dispatcher = require('./dispatcher');
Dispersive.EventEmitter = require('./emitter');
Dispersive.ObjectManager = require('./manager');
Dispersive.Model = require('./model');
Dispersive.QuerySet = require('./queryset');
Dispersive.Schema = require('./schema');
Dispersive.Component = require('./component');
Dispersive.Store = require('./store');

/*
 * Alias
 */

Dispersive.IndexedField = Dispersive.Schema.IndexedField;
Dispersive.ListStateField = Dispersive.Component.ListStateField;
Dispersive.UniqueStateField = Dispersive.Component.UniqueStateField;
Dispersive.CountStateField = Dispersive.Component.CountStateField;
Dispersive.createAction = Dispersive.Action.create;
Dispersive.usingEventFunnel = Dispersive.EventEmitter.Funnel.using;
Dispersive.mixin = Dispersive.Component.mixin;

// Default instances

Dispersive.store = new Dispersive.Store();
Dispersive.dispatcher = Dispersive.Dispatcher.main;
