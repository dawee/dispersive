const Dispersive = module.exports = {};

const {Action, ActionTree} = require('./action');
Dispersive.Dispatcher = require('./dispatcher');
Dispersive.EventEmitter = require('./emitter');
Dispersive.ObjectManager = require('./manager');
Dispersive.Model = require('./model');
Dispersive.QuerySet = require('./queryset');
Dispersive.Schema = require('./schema');
Dispersive.Store = require('./store');

/*
 * Alias
 */

Dispersive.IndexedField = Dispersive.Schema.IndexedField;
Dispersive.createAction = Action.create;
Dispersive.ActionTree = ActionTree;
Dispersive.Action = Action;
Dispersive.usingEventFunnel = Dispersive.EventEmitter.Funnel.using;

// Default instances

Dispersive.store = new Dispersive.Store();
Dispersive.dispatcher = Dispersive.Dispatcher.main;
