const createFilterPredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] === expression[key])
);

const getFilterPredicate = expression => (
  typeof expression === 'function' ? expression : createFilterPredicate(expression)
);


class QuerySet {

  constructor({parent = null, predicate = null, QuerySetConstructor = QuerySet}) {
    this.parent = parent;
    this.predicate = predicate;
    this.QuerySetConstructor = QuerySetConstructor;
  }

  validate(entry) {
    return !this.predicate || this.predicate(entry);
  }

  * entries() {
    for (const entry of this.parent.entries()) {
      if (this.validate(entry)) yield entry;
    }
  }

  filter(expression) {
    return new this.QuerySetConstructor({
      parent: this,
      predicate: getFilterPredicate(expression),
    });
  }

  map(transform) {
    const res = [];

    for (const entry of this.entries()) {
      res.push(transform(entry));
    }

    return res;
  }

  first() {
    return this.entries().next().value;
  }

  get(expression) {
    return this.filter(expression).first();
  }

  get length() {
    return this.map(entry => entry).length;
  }

}

module.exports = {
  QuerySet,
};
