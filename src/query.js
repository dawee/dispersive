const sortBy = require('sort-by');

const REVERSED = 1;

/*
 * Filter
 */

const createFilterPredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] === expression[key])
);

const getFilterPredicate = expression => (
  typeof expression === 'function' ? expression : createFilterPredicate(expression)
);

/*
 * Exclude
 */

const createExcludePredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] !== expression[key])
);

const getExcludePredicate = expression => (
  typeof expression === 'function' ? expression : createExcludePredicate(expression)
);

/*
 * Mixin
 */

const withSortedEntries = ({ Base, sortComparator }) => class extends Base {

  * entries() {
    for (const [, entry] of this.parent.toArray().sort(sortComparator).entries()) {
      yield entry;
    }
  }

};

const withFilteredEntries = ({ Base, predicate }) => class extends Base {

  * entries() {
    for (const entry of this.parent.entries()) {
      if (predicate(entry)) yield entry;
    }
  }

};

const withEmptyGenerator = ({ Base }) => class extends Base {

  * entries() {}

};

const withQueries = QuerySetBase => class extends QuerySetBase {

  filter(expression) {
    const Base = this.QuerySetConstructor;
    const predicate = getFilterPredicate(expression);
    const QuerySetConstructor = withFilteredEntries({ Base, predicate });

    return this.clone({ QuerySetConstructor });
  }

  exclude(expression) {
    const Base = this.QuerySetConstructor;
    const predicate = getExcludePredicate(expression);
    const QuerySetConstructor = withFilteredEntries({ Base, predicate });

    return this.clone({ QuerySetConstructor });
  }

  sort(sortComparator) {
    const Base = this.QuerySetConstructor;
    const QuerySetConstructor = withSortedEntries({ Base, sortComparator });

    return this.clone({ QuerySetConstructor });
  }

  reverse() {
    const Base = this.QuerySetConstructor;
    const sortComparator = () => REVERSED;
    const QuerySetConstructor = withSortedEntries({ Base, sortComparator });

    return this.clone({ QuerySetConstructor });
  }

  none() {
    const Base = this.QuerySetConstructor;
    const QuerySetConstructor = withEmptyGenerator({ Base });

    return this.clone({ QuerySetConstructor });
  }

  orderBy(...fields) {
    const sortComparator = sortBy(...fields);

    return this.sort(sortComparator);
  }

  all() {
    return this.clone({ QuerySetConstructor: this.QuerySetConstructor });
  }

};

module.exports = {
  withQueries,
  getFilterPredicate,
  getExcludePredicate,
};
