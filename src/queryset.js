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

  get(expression) {
    return expression ? this.filter(expression).first() : this.first();
  }

  get length() {
    return this.toArray().length;
  }

  every(predicate) {
    let res = true;
    let index = 0;

    for (const entry of this.entries()) {
      if (!predicate(entry, index)) {
        res = false;
        break;
      }

      index += 1;
    }

    return res;
  }

  map(predicate) {
    const res = [];

    this.every((entry, index) => {
      res.push(predicate(entry, index));
      return true;
    });

    return res;
  }

  toArray() {
    return this.map(entry => entry);
  }

  toJSON() {
    return this.map(entry => entry.toJSON());
  }

  first() {
    return this.entries().next().value;
  }

  last() {
    const array = this.toArray();
    return array[array.length - 1];
  }

  delete() {
    return this.map(entry => entry.delete());
  }

}

module.exports = {
  QuerySet,
};
