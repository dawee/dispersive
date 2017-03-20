const { withQueries } = require('./query');
const { withExporters } = require('./export');

class QuerySetBase {

  static extractValues([,values]) {
    return values;
  }

  constructor({ QuerySetConstructor, values, manager }) {
    this.QuerySetConstructor = QuerySetConstructor;
    this.manager = manager;
    this.values = values;
  }

  runForEach(iterator, predicate, index = 0) {
    const entry = iterator.next();

    if (!entry.done) {
      predicate(this.manager.build(this.constructor.extractValues(entry.value)), index);
      this.runForEach(iterator, predicate, index + 1);
    }
  }

  forEach(predicate) {
    return this.runForEach(this.values.entries(), predicate);
  }

  update(rawValues) {
    this.forEach(entry => entry.update(rawValues));
  }

  delete() {
    this.forEach(entry => entry.delete());
  }

  clone() {
    return this.subset({});
  }

  subset({ values = this.values, manager = this.manager }) {
    return new this.QuerySetConstructor({
      values,
      manager,
      QuerySetConstructor: this.QuerySetConstructor,
    });
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
