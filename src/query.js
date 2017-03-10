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

const withQueries = Base => class extends Base {

  filter(expression) {
    return this.clone({predicate: getFilterPredicate(expression)});
  }

  exclude(expression) {
    return this.clone({predicate: getExcludePredicate(expression)});
  }

};

module.exports = {
  withQueries,
  getFilterPredicate,
  getExcludePredicate,
};
