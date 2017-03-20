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

  map(predicate) {
    const res = [];

    this.forEach((entry, index) => res.push(predicate(entry, index)));

    return res;
  }

  every(expression) {
    const predicate = getFilterPredicate(expression);
    let res = true;

    this.forEach((entry, index) => res = res && predicate(entry, index));

    return res;
  }

  some(expression) {
    const predicate = getFilterPredicate(expression);
    let res = false;

    this.forEach((entry, index) => res = res || predicate(entry, index));

    return res;
  }

  any(expression) {
    return this.some(expression);
  }

  toArray() {
    return this.map(entry => entry);
  }

  first() {
    const values = this.values.first();

    return values ? this.manager.build(values) : null;
  }

  last() {
    const array = this.toArray();
    return array[array.length - 1];
  }

};

module.exports = {
  withExporters,
};
