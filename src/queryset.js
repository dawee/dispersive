const {withQueries} = require('./query');
const {withExporters} = require('./export');


class QuerySetBase {

  constructor({QuerySetConstructor, parent = null, predicate = null}) {
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

  delete() {
    return this.map(entry => entry.delete());
  }

}

const QuerySetWithQueries = withQueries(QuerySetBase);
const QuerySetWithExporters = withExporters(QuerySetWithQueries);


class QuerySet extends QuerySetWithExporters {

  constructor({parent = null, predicate = null, QuerySetConstructor = QuerySet}) {
    super({parent, predicate, QuerySetConstructor});
  }

}

module.exports = {
  QuerySet,
};
