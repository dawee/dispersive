const assert = require('assert');
const Immutable = require('immutable');
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

  nextEntry(iterator) {
    const next = iterator.next();

    return next.done ? null : this.manager.build(this.constructor.extractValues(next.value));
  }

  runForEach(iterator, predicate, index = 0) {
    const entry = this.nextEntry(iterator);

    if (entry) {
      predicate(entry, index);
      this.runForEach(iterator, predicate, index + 1);
    }
  }

  forEach(predicate) {
    return this.runForEach(this.values.entries(), predicate);
  }

  reduce(predicate, initial = null) {
    const entries = this.values.entries();
    const runNext = (memo, index = 0) => {
      const entry = this.nextEntry(entries);

      return entry ? runNext(predicate(memo, entry, index + 1)) : memo;
    };

    return runNext(initial);
  }

  map(predicate) {
    return this.reduce((list, entry, index) => (
      list.push(predicate(entry, index))
    ), Immutable.List()).toJS();
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

  subsetFromArray(valuesArray) {
    return this.subset({ values: Immutable.OrderedMap(valuesArray) });
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
