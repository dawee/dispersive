const createFilterPredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] === expression[key])
);

const getFilterPredicate = expression => (
  typeof expression === 'function' ? expression : createFilterPredicate(expression)
);

const withQueries = Base => class extends Base {

  filter(expression) {
    return new this.QuerySetConstructor({
      parent: this,
      predicate: getFilterPredicate(expression),
    });
  }

};

module.exports = {
  withQueries,
};
