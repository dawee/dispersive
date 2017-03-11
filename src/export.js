const {getFilterPredicate} = require('./query');


const withExporters = Base => class extends Base {

  * entriesWithIndex() {
    let index = 0;

    for (const entry of this.entries()) {
      yield [entry, index];
      index += 1;
    }
  }

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

    for (const [entry, index] of this.entriesWithIndex()) {
      res.push(predicate(entry, index));
    }

    return res;
  }

  every(expression) {
    const predicate = getFilterPredicate(expression);
    let res = true;

    for (const [entry, index] of this.entriesWithIndex()) {
      if (!predicate(entry, index)) {
        res = false;
        break;
      }
    }

    return res;
  }

  some(expression) {
    const predicate = getFilterPredicate(expression);
    let res = false;

    for (const [entry, index] of this.entriesWithIndex()) {
      if (predicate(entry, index)) {
        res = true;
        break;
      }
    }

    return res;
  }

  any(expression) {
    return this.some(expression);
  }

  toArray() {
    return this.map(entry => entry);
  }

  toJSON() {
    return this.map(entry => entry.toJSON());
  }

  first() {
    return this.entries().next().value;
  }

  last() {
    const array = this.toArray();
    return array[array.length - 1];
  }

};

module.exports = {
  withExporters,
};
