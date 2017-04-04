const assert = require('assert');
const { withQueries } = require('./query');
const { withExporters } = require('./export');

class QuerySetBase {

  static extractValues([, values]) {
    return values;
  }

  constructor({ QuerySetConstructor, values, manager }) {
    assert.ok(values, 'Trying to create a queryset without values');

    this.QuerySetConstructor = QuerySetConstructor;
    this.manager = manager;
    this.values = values;
  }

  forEach(predicate) {
    this.values.forEach((values, index) => predicate(this.manager.build(values), index));
  }

  reduce(predicate, initial = null) {
    return this.values.reduce((memo, values, index) => {
      const entry = this.manager.build(values);

      return predicate(memo, entry, index);
    }, initial);
  }

  update(rawValues) {
    return this.reduce((res, entry) => res && entry.update(rawValues), true);
  }

  delete() {
    return this.reduce((res, entry) => res && entry.delete(), true);
  }

  clone() {
    return this.subset({});
  }

  subset({
    values = this.values,
    manager = this.manager,
    QuerySetConstructor = this.QuerySetConstructor,
  }) {
    return new QuerySetConstructor({
      values,
      manager,
      QuerySetConstructor,
    });
  }

}

const QuerySetWithQueries = withQueries(QuerySetBase);
const QuerySetWithExporters = withExporters(QuerySetWithQueries);


class QuerySet extends QuerySetWithExporters {

  constructor({ QuerySetConstructor = QuerySet, values, manager }) {
    super({ QuerySetConstructor, values, manager });
  }

}

module.exports = {
  QuerySet,
};
