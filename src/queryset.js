const { withQueries } = require('./query');
const { withExporters } = require('./export');


class QuerySetBase {

  constructor({ QuerySetConstructor, parent = null }) {
    this.parent = parent;
    this.QuerySetConstructor = QuerySetConstructor;
  }

  * entries() {
    for (const entry of this.parent.entries()) {
      yield entry;
    }
  }

  update(rawValues) {
    for (const entry of this.entries()) {
      entry.update(rawValues);
    }
  }

  delete() {
    for (const entry of this.entries()) {
      entry.delete();
    }
  }

  clone({ QuerySetConstructor = this.QuerySetConstructor }) {
    return new QuerySetConstructor({ parent: this, QuerySetConstructor: this.QuerySetConstructor });
  }

}

const QuerySetWithQueries = withQueries(QuerySetBase);
const QuerySetWithExporters = withExporters(QuerySetWithQueries);


class QuerySet extends QuerySetWithExporters {

  constructor(opts = {}) {
    super(Object.assign({ QuerySetConstructor: QuerySet }, opts));
  }

}

module.exports = {
  QuerySet,
};
