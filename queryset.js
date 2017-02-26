const createFilterPredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] === expression[key])
);

const getFilterPredicate = expression => (
  typeof expression === 'function' ? expression : createFilterPredicate(expression)
)


class QuerySet {

  constructor({parent = null, predicate = null}) {
    if (parent) this.parent = parent;
    if (predicate) this.predicate = predicate;
  }

  validate(entry) {
    return !this.predicate || this.predicate(entry);
  }

  *entries() {
    for (const entry of this.parent.entries()) {
      if (this.validate(entry)) yield entry;
    }
  }

  filter(expression) {
    return new QuerySet({parent: this, predicate: getFilterPredicate(expression)});
  }

  map(transform) {
    const res = [];

    for (const entry of this.entries()) {
      res.push(transform(entry));
    }

    return res;
  }

}

module.exports = {
  QuerySet,
};
