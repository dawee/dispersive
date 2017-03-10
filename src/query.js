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
 * Mixin
 */

const withQueries = Base => class extends Base {

  filter(expression) {
    return this.clone({predicate: getFilterPredicate(expression)});
  }

};

module.exports = {
  withQueries,
};
