const Immutable = require('immutable');
const { getFilterPredicate } = require('./query');


const withExporters = Base => class extends Base {

  get(expression) {
    if (typeof expression === 'string') this.parent.get(expression);

    return expression ? this.filter(expression).first() : this.first();
  }

  count() {
    return this.toArray().length;
  }

  get length() {
    return this.count();
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

  every(expression) {
    const predicate = getFilterPredicate(expression);

    return this.reduce((result, entry, index) => result && predicate(entry, index), true);
  }

  some(expression) {
    const predicate = getFilterPredicate(expression);

    return this.reduce((result, entry, index) => result || predicate(entry, index), false);
  }

  any(expression) {
    return this.some(expression);
  }

  toArray() {
    return this.map(entry => entry);
  }

  first() {
    return this.nextEntry(this.values.entries());
  }

  last() {
    const array = this.toArray();
    return array[array.length - 1];
  }

};

module.exports = {
  withExporters,
};
