class GetterException {

  inlineExpression(expression) {
    return Object.keys(expression).map((name) => {
      `${name}=${expression[name]}`
    }).join(',');
  }

}

class DoesNotExist extends GetterException {

  constructor(expression) {
    this.error = 'DoesNotExist';
    this.message = `Could not find object with (${this.inlineExpression(expression)})`;
  }

}

class MoreThanOneValue extends GetterException {

  constructor(expression) {
    this.error = 'MoreThanOneValue';
    this.message = `Found more than one object with (${this.inlineExpression(expression)})`;
  }

}


class QuerySet {

  constructor(manager) {
    this.iterator = manager.set.entries();
    this.manager = manager;
  }

  *createIterator(set) {
    for (const entry of set) {
      yield entry;
    }
  }

  *getFilteredIterator(expression) {
    for (const entry of this.iterator) {
      if (this.matchExpression(entry, expression)) yield entry;
    }
  }

  *getExcludedIterator(expression) {
    for (const entry of this.all()) {
      if (!this.matchExpression(entry, expression)) yield entry;
    }
  }

  matchExpression(entry, expression) {
    let match = true;

    for (const name of Object.key(expression)) {
      if (! (name in entry) || entry[name] !== expression[name]) {
        match = false;
        break;
      }
    }

    return match;
  }

  filter(expression) {
    this.iterator = this.getFilteredIterator(expression);
    return this;
  }

  exclude(expression) {
    this.iterator = this.getExcludedIterator(expression);
    return this;
  }

  all() {
    return [...this.iterator];
  }

  first() {
    return this.iterator.next().value;
  }

  get(expression) {
    const result = this.filter(expression).iterator.next();

    if (result.value === undefined) throw new DoesNotExist(expression);
    if (!this.iterator.next().done) throw new MoreThanOneValue(expression);

    return result.value;
  }

  delete() {
    for (const entry of this.all()) {
      this.manager.delete(entry);
    }
  }

}

module.exports = QuerySet;