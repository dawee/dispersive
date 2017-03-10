const {withQueries} = require('./query');
const {withExporters} = require('./export');


class QuerySetBase {

  constructor({QuerySetConstructor, parent = null}) {
    this.parent = parent;
    this.QuerySetConstructor = QuerySetConstructor;
  }

  clone(opts = {}, QuerySetConstructor = this.QuerySetConstructor) {
    return new QuerySetConstructor(Object.assign({parent: this}, opts));
  }

  delete() {
    return this.map(entry => entry.delete());
  }

}

const QuerySetWithQueries = withQueries(QuerySetBase);
const QuerySetWithExporters = withExporters(QuerySetWithQueries);


class QuerySet extends QuerySetWithExporters {

  constructor(opts = {}) {
    super(Object.assign({QuerySetConstructor: QuerySet}, opts));
  }

}

module.exports = {
  QuerySet,
};
