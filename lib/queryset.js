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


class QuerySet extends EventEmitter {

  constructor(opts = {}) {
    super();
    this.orderedBy = opts.orderedBy || null;
    this.filterExpression = opts.filterExpression || null;
    this.excludeExpression = opts.excludeExpression || null;
    this.generator = opts.generator;
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

  filter(expression) {
    return new QuerySet({
      filterExpression: expression,
      generator: this.entries.bind(this),
    });
  }

  exclude(expression) {
    return new QuerySet({
      excludeExpression: expression,
      generator: this.entries.bind(this),
    });
  }

  orderBy(name) {
    return new QuerySet({
      orderedBy: name,
      generator: this.entries.bind(this),
    });
  }

  sort(entry1, entry2) {
    let result = 0;
    const sortable = !!this.orderedBy
      && (this.orderedBy in entry1)
      && (this.orderedBy in entry2)
      && (typeof entry1[this.orderedBy] === typeof entry2[this.orderedBy]);

    if (sortable) {
      switch (typeof entry1[this.orderedBy]) {
        case 'string':
          result = entry1[this.orderedBy].localeCompare(entry2[this.orderedBy]);
          break;

        case 'number':
          result = entry1[this.orderedBy] - entry2[this.orderedBy];
          break;

        default:
          break;
      }
    }

    return result;
  }

  *entries() {
    for (const entry of [...this.generator()].sort(this.sort.bind(this))) {
      const filterMatch = this.filterExpression === null
        || this.matchExpression(entry.values(), this.filterExpression);

      const excludeMatch = this.excludeExpression === null
        || !this.matchExpression(entry.values(), this.excludeExpression);

      if (filterMatch && excludeMatch) yield entry;
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

  count() {
    return this.all().length;
  }

  delete() {
    this.all().forEach((entry) => entry.delete());
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
