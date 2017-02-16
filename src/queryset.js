const EventEmitter = require('./emitter');
const util = require('util');


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


/** Filter, Sort and retrieve store elements. */
class QuerySet extends EventEmitter {

  /**
   * Should not be called directly.
   * Querysets are created by the ObjectManager or another queryset
   */
  constructor(opts = {}) {
    super();
    this.orderedBy = opts.orderedBy || null;
    this.predicate = opts.predicate || null;
    this.parent = opts.parent || null;
    this.prefilters = opts.prefilters || [];
    this.reversed = opts.reversed || false;
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
    return this.manager.emitter.addListener(name, data => {
      const targeted = (('__source__' in data) && this.validate(data.__source__))
        || (('__sources__' in data) && this.validateAny(data.__sources__));

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

  createQuerySet({reversed = false, predicate = null, prefilters = [], orderedBy = null}) {
    return new QuerySet({
      orderedBy, predicate, prefilters, reversed,
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

  /**
   * Filter results.
   *
   * @param {object/function} expression/predicate - the object that entries should match or a predicate.
   * For preformance issues, always prefer expression over predicate if possible (see indexed fields).
   *
   * @return A new queryset
   *
   * @example
   * // Using object
   * let sortedTodos = store.todos.filter({checked: true});
   * // Using predicate :
   * // let sortedTodos = store.todos.filter(todo => todo.checked);
   * for (const checkedTodo of sortedTodos.entries()) {
   *   console.log(`"${checkedTodo.text}" was checked`);
   * }
   */
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

  /**
   * Exclude results.
   *
   * See filter.
   */
  exclude(expressionOrPredicate) {
    if (typeof expressionOrPredicate === 'function') {
      return this._excludeUsingPredicate(expressionOrPredicate);
    }

    return this._excludeUsingExpression(expressionOrPredicate);
  }

  _orderByUsingName(name, {reversed = false}) {
    this.assertInSchema(name);

    return this.createQuerySet({
      reversed,
      orderedBy: (entry) => entry[name],
    });
  }

  _orderByUsingPredicate(predicate, {reversed = false}) {
    return this.createQuerySet({
      reversed,
      orderedBy: predicate,
    });
  }

  /**
   * Order results.
   *
   * @param {string/function} parameter/predicate - The parameter name to order with or a predicate.
   * @param [opts] - Options
   * @param {bool} [opts.reversed] - If true, the order is reversed
   *
   * @return A new queryset
   *
   * @example
   * // Order todos by text (ascending) :
   * store.todos.orderBy('age')
   * // Using predicate : store.todos.orderBy(todo => todo.age)
   *
   * // Order todos by text (descending) :
   * store.todos.orderBy('age', {reversed: true})
   */
  orderBy(nameOrPredicate, opts) {
    if (typeof nameOrPredicate === 'string') {
      return this._orderByUsingName(nameOrPredicate, opts || {});
    }

    return this._orderByUsingPredicate(nameOrPredicate, opts || {});
  }

  validate({values = {}, prevalues = null}) {
    const valid = (
      !this.predicate
      || !!prevalues && this.predicate(values) !== this.predicate(prevalues)
      || !prevalues && this.predicate(values)
    );

    return valid && !!this.parent ? this.parent.validate({values, prevalues}) : valid;
  }

  validateAny(sourcesArray) {
    let validate = false;

    for (const source of sourcesArray) {
      validate = this.validate(source);
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

      return this.reversed ? -result : result;
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

  map(predicate) {
    const results = [];

    for (const entry of this.entries()) {
      results.push(predicate(entry));
    }

    return results;
  }

  values(opts) {
    return this.all().map(model => model.values(opts));
  }

  /**
   * List all results
   *
   * @return An array of models
   */
  all() {
    return [...this.entries()];
  }

  /**
   * Returns the first entry
   *
   * @return A model
   */
  first() {
    return this.entries().next().value;
  }

  /**
   * Returns an entry at a specified index
   * @param {number} index - The index in the list
   *
   * @return A model
   */
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

  _range({start = 0, stop = Infinity, step = 1}) {
    const entries = this.entries();
    const results = [];
    let entry = null;
    let counter = 0;

    for (counter = 0; counter < stop; ++counter) {
      entry = entries.next();

      if (counter >= start && !!entry.value && counter % step === 0) {
        results.push(entry.value);
      }

      if (entry.done) break;
    }

    return results;
  }

  range(start = null, stop = null, step = 1) {
    const config = !!start && typeof start === 'object' ? start : null;

    if (!config && stop === null) return this.range(0, start, step);

    return !!config ? this._range(config) : this._range({start, stop, step});
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
    if (process.env.NODE_ENV !== 'production') {
      util.debuglog('queryset.count() is deprecated. Use queryset.all().length instead');
    }

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
