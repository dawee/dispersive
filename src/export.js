const withExporters = Base => class extends Base {

  * entriesWithIndex() {
    let index = 0;

    for (const entry of this.entries()) {
      yield [entry, index];
      index += 1;
    }
  }

  get(expression) {
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
