const clone = require('101/clone');


class GetterException {

  inlineExpression(expression) {
    return Object.keys(expression).map((name) => `${name}=${expression[name]}`).join(',');
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


class QuerySet {

  constructor(manager, filterExpression, excludeExpression, generator) {
    this.filterExpression = filterExpression || null;
    this.excludeExpression = excludeExpression || null;
    this.generator = generator || (() => manager.values);
    this.manager = manager;
    this.entries = this.entries.bind(this);
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
    return new QuerySet(this.manager, expression, null, this.entries);
  }

  exclude(expression) {
    return new QuerySet(this.manager, null, expression, this.entries);
  }

  *entries() {
    for (const entry of this.generator()) {
      const filterMatch = this.filterExpression === null
        || this.matchExpression(entry, this.filterExpression);

      const excludeMatch = this.excludeExpression === null
        || !this.matchExpression(entry, this.excludeExpression);

      if (filterMatch && excludeMatch) {
        yield entry;
      }
    }
  }

  all() {
    return [...this.entries()];
  }

  first() {
    return this.entries().next().value;
  }

  get(expression) {
    const iterator = this.filter(expression).entries();
    const entry = iterator.next();

    if (entry.value === undefined) throw new DoesNotExist(expression);
    if (!iterator.next().done) throw new MoreThanOneValue(expression);

    return entry.value;
  }

  delete() {
    for (const entry of this.all()) {
      this.manager.delete(entry);
    }
  }

}

module.exports = QuerySet;
