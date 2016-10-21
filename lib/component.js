const QuerySet = require('./queryset');


class StateField {

  constructor(querysetResolver) {
    if (querysetResolver instanceof QuerySet) {
      this.querysetResolver = () => querysetResolver;
    } else {
      this.querysetResolver = querysetResolver;
    }
  }

  resolveEmitter(queryset) {
    return queryset;
  }

  resolveQueryset(props) {
    return this.querysetResolver.call(null, props);
  }

}

class ListStateField extends StateField {

  values(queryset) {
    return queryset.values();
  }

}

class UniqueStateField extends StateField {

  resolveEmitter(queryset) {
    return queryset.get();
  }

  values(queryset) {
    return queryset.get().values();
  }

}

class CountStateField extends StateField {

  values(queryset) {
    return queryset.count();
  }

}

class StateFieldApplier {

  constructor(stateField, props) {
    this.stateField = stateField;
    this.queryset = this.stateField.resolveQueryset(props);
    this.emitter = this.stateField.resolveEmitter(this.queryset);
  }

  values() {
    return this.stateField.values(this.queryset);
  }

}

const Component = {ListStateField, UniqueStateField, CountStateField};


Component.attach = (component, config = {}) => {
  if (!!config.events) component.eventsNames = config.events;
  if (!!config.context) component.contextTypes = config.context;
  if (!!config.props) component.propTypes = config.props;
  if (!!config.state) component.stateFields = config.state;

  return component;
};

Component.mixin = (ComponentBase, attached = null) => {
  class ChildComponent extends ComponentBase {

    constructor(...args) {
      super(...args);
      this.applyStateFields();
      this.bindEvents();
      this.listenStores();
      this.initState();
    }

    applyStateFields() {
      const stateFields = this.constructor.stateFields || {};

      this._fields = {};

      for (const key of Object.keys(stateFields)) {
        this._fields[key] = new StateFieldApplier(stateFields[key], this.props);
      }
    }

    bindEvents() {
      const eventsNames = this.constructor.eventsNames || [];

      for (const eventName of eventsNames) {
        this[eventName] = this[eventName].bind(this);
      }
    }

    listenStores() {
      for (const key of Object.keys(this._fields)) {
        this._fields[key].emitter.changed(() => this.updateStateValue(key));
      }
    }

    initState() {
      this.state = {};

      Object.keys(this._fields).forEach(key => this.initStateValue(key));
    }

    initStateValue(key) {
      this.state[key] = this._fields[key].values();
    }

    updateStateValue(key) {
      const setter = {};

      setter[key] = this._fields[key].values();
      this.setState(setter);
    }
  }

  if (!!attached) Component.attach(ChildComponent, attached);

  return ChildComponent;
};


module.exports = Component;
