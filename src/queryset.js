const EventEmitter = require('./emitter');


class GetterException {

  inlineExpression(expression) {
    return Object.keys(expression || {}).map((name) => `${name}=${expression[name]}`).join(',');
  }

}

class DoesNotExist extends GetterException {

  constructor(expression) {
    super();
    this.name = 'DoesNotExist';
    this.message = `Could not find object with (${this.inlineExpression(expression)})`;
  }

}

class MoreThanOneValue extends GetterException {

  constructor(expression) {
    super();
    this.name = 'MoreThanOneValue';
    this.message = `Found more than one object with (${this.inlineExpression(expression)})`;
  }

}

class NotInSchema {

  constructor(name) {
    this.name = 'NotInSchema';
    this.message = `Model has no '${name}' in schema`;
  }

}

class OutOfRange {

  constructor(index) {
    this.name = 'OutOfRange';
    this.message = `index (${index}) is out of objects range`;
  }

}


class QuerySet extends EventEmitter {

  constructor(opts = {}) {
    super();
    this.orderedBy = opts.orderedBy || null;
    this.predicate = opts.predicate || null;
    this.parent = opts.parent || null;
    this.prefilters = opts.prefilters || [];
    this.model = opts.model;
    this.generator = opts.generator;
    this.manager = opts.manager;
  }

  matchExpression(values, expression) {
    let match = true;

    for (const name of Object.keys(expression)) {
      if (! (name in values) || values[name] !== expression[name]) {
        match = false;
        break;
      }
    }

    return match;
  }

  on(name, listener, ctx = null) {
    if (this.manager === this) return super.on(name, listener, ctx);

    this.manager.on(name, data => {
      const targeted = (('source' in data) && this.validate(data.source))
        || (('sources' in data) && this.validateAny(data.sources));

      if (targeted) listener.call(ctx, data);
    });
  }

  emit(...args) {
    if (this.manager === this) return super.emit(...args);

    this.manager.emit(...args);
  }

  assertInSchema(name) {
    if (! this.model.schema.has(name)) throw new NotInSchema(name);
  }

  assertExpressionInSchema(expression) {
    for (const name of Object.keys(expression)) {
      this.assertInSchema(name);
    }
  }

  _extractPrefilters(expression) {
    const prefilters = [];

    for (const name of Object.keys(expression)) {
      const val = expression[name];

      if (this.model.schema.isIndexed(name)) {
        prefilters.push({name, val});
      }
    }

    return prefilters;
  }

  createQuerySet({predicate = null, prefilters = [], orderedBy = null}) {
    return new QuerySet({
      orderedBy, predicate, prefilters,
      generator: this.entries.bind(this),
      manager: this.manager,
      parent: this,
      model: this.model,
    });
  }

  _filterUsingExpression(expression) {
    this.assertExpressionInSchema(expression);

    return this.createQuerySet({
      predicate: (values) => this.matchExpression(values, expression),
      prefilters: this._extractPrefilters(expression),
    });
  }

  _filterUsingPredicate(predicate) {
    return this.createQuerySet({predicate});
  }

  filter(expressionOrPredicate) {
    if (typeof expressionOrPredicate === 'function') {
      return this._filterUsingPredicate(expressionOrPredicate);
    }

    return this._filterUsingExpression(expressionOrPredicate);
  }

  _excludeUsingExpression(expression) {
    this.assertExpressionInSchema(expression);

    return this.createQuerySet({
      predicate: (values) => !this.matchExpression(values, expression),
    });
  }

  _excludeUsingPredicate(predicate) {
    return this.createQuerySet({
      predicate: (values) => !predicate(values),
    });
  }

  exclude(expressionOrPredicate) {
    if (typeof expressionOrPredicate === 'function') {
      return this._excludeUsingPredicate(expressionOrPredicate);
    }

    return this._excludeUsingExpression(expressionOrPredicate);
  }

  _orderByUsingName(name) {
    this.assertInSchema(name);

    return this.createQuerySet({
      orderedBy: (entry) => entry[name],
    });
  }

  _orderByUsingPredicate(predicate) {
    return this.createQuerySet({
      orderedBy: predicate,
    });
  }

  orderBy(nameOrPredicate) {
    if (typeof nameOrPredicate === 'string') {
      return this._orderByUsingName(nameOrPredicate);
    }

    return this._orderByUsingPredicate(nameOrPredicate);
  }

  validate(values) {
    if (!!this.predicate && !this.predicate(values)) return false;

    return !!this.parent ? this.parent.validate(values) : true;
  }

  validateAny(valuesArray) {
    let validate = false;

    for (const values of valuesArray) {
      validate = this.validate(values);
      if (validate) break;
    }

    return validate;
  }

  sortEntries(entries, predicate) {
    return entries.sort((entry1, entry2) => {
      let result = 0;
      const value1 = predicate(entry1);
      const value2 = predicate(entry2);

      const sortable = (typeof value1 === typeof value2);

      if (sortable) {
        switch (typeof value1) {
          case 'string':
            result = value1.localeCompare(value2);
            break;

          case 'number':
            result = value1 - value2;
            break;

          default:
            break;
        }
      }

      return result;
    });
  }

  *entries(prefilters = []) {
    const mixedPrefilters = this.prefilters.concat(prefilters);
    const entries = !!this.orderedBy
      ? this.sortEntries([...this.generator(mixedPrefilters)], this.orderedBy)
      : this.generator(mixedPrefilters);

    for (const entry of entries) {
      if (!this.predicate || this.predicate(entry.schemaValues())) yield entry;
    }
  }

  values(opts) {
    return this.all().map(model => model.values(opts));
  }

  all() {
    return [...this.entries()];
  }

  first() {
    return this.entries().next().value;
  }

  at(index) {
    const entries = this.entries();
    let entry = {value: undefined, done: true};
    let counter = 0;

    for (counter = 0; counter <= index; ++counter) {
      entry = entries.next();

      if (entry.done) break;
    }

    if (entry.value === undefined || counter < index) {
      throw new OutOfRange(index);
    }

    return entry.value;
  }

  last() {
    const all = this.all();

    return all[all.length - 1];
  }

  update(values, opts) {
    for (const entry of this.entries()) {
      entry.update(values, opts);
    }

    return this;
  }

  count() {
    return this.all().length;
  }

  delete() {
    for (const entry of this.entries()) {
      entry.delete();
    }

    return this;
  }

  get(expression) {
    const iterator = !!expression ? this.filter(expression).entries() : this.entries();
    const entry = iterator.next();

    if (entry.value === undefined) throw new DoesNotExist(expression);
    if (!iterator.next().done) throw new MoreThanOneValue(expression);

    return entry.value;
  }

}

module.exports = QuerySet;