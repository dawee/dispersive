const sortBy = require('sort-by');

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

const withQueries = QuerySetBase => class extends QuerySetBase {

  filter(expression) {
    const predicate = getFilterPredicate(expression);

    return this.subset({
      values: this.values.filter(
        (values, index) => predicate(this.manager.build(values), index)
      ),
    });
  }

  exclude(expression) {
    const predicate = getExcludePredicate(expression);

    return this.subset({
      values: this.values.filter(
        (values, index) => predicate(this.manager.build(values), index)
      ),
    });
  }

  sort(predicate) {
    return this.subset({
      values: this.values.sort(
        (values1, values2) => predicate(this.manager.build(values1), this.manager.build(values2))
      )
    });
  }

  reverse() {
    return this.subset({ values: this.values.reverse() });
  }

  orderBy(...fields) {
    const sortComparator = sortBy(...fields);

    return this.sort(sortComparator);
  }

  all() {
    return this.clone();
  }

};

module.exports = {
  withQueries,
  getFilterPredicate,
  getExcludePredicate,
};
