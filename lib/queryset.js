const clone = require('101/clone');


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

function *baseGenerator(values) {
  for (const entry of values) {
    yield entry;
  }
}


class QuerySet {

  constructor(manager, opts) {
    opts = opts || {};
    
    this.orderedBy = opts.orderedBy;
    this.filterExpression = opts.filterExpression || null;
    this.excludeExpression = opts.excludeExpression || null;
    this.generator = opts.generator || this.baseGenerator;
    this.manager = manager;
  }

  *baseGenerator() {
    for (const entry of this.manager.values) {
      yield entry;
    }
  }

  matchExpression(entry, expression) {
    let match = true;

    for (const name of Object.keys(expression)) {
      if (! (name in entry) || entry[name] !== expression[name]) {
        match = false;
        break;
      }
    }

    return match;
  }

  filter(expression) {
    return new QuerySet(this.manager, {
      filterExpression: expression,
      generator: this.entries.bind(this)
    });
  }

  exclude(expression) {
    return new QuerySet(this.manager, {
      excludeExpression: expression,
      generator: this.entries.bind(this)
    });
  }

  orderBy(name) {
    return new QuerySet(this.manager, {
      orderedBy: name,
      generator: this.entries.bind(this)
    });
  }

  sort(entry1, entry2) {
    let result = 0;
    let sortable = !!this.orderedBy
      && (this.orderedBy in entry1)
      && (this.orderedBy in entry2)
      && (typeof entry1[this.orderedBy] === typeof entry2[this.orderedBy]);

    switch(typeof entry1[this.orderedBy]) {
      case 'string':
        result = entry1[this.orderedBy].localeCompare(entry2[this.orderedBy]);
        break;

      case 'number':
        result = entry1[this.orderedBy] - entry2[this.orderedBy];
        break

      default:
        break;
    }

    return result;
  }

  *entries() {
    for (const entry of [...this.generator()].sort(this.sort.bind(this))) {
      const filterMatch = this.filterExpression === null
        || this.matchExpression(entry, this.filterExpression);

      const excludeMatch = this.excludeExpression === null
        || !this.matchExpression(entry, this.excludeExpression);

      if (filterMatch && excludeMatch) yield entry;
    }
  }

  all() {
    return [...this.entries()];
  }

  first() {
    return this.entries().next().value;
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
