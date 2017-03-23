const { getFilterPredicate } = require('./query');


const withExporters = Base => class extends Base {

  get(expression) {
    if (typeof expression === 'string') this.manager.get(expression);

    return expression ? this.filter(expression).first() : this.first();
  }

  count() {
    return this.toArray().length;
  }

  get length() {
    return this.count();
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

};

module.exports = {
  withExporters,
};
