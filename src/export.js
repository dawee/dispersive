const withExporters = Base => class extends Base {

  get(expression) {
    return expression ? this.filter(expression).first() : this.first();
  }

  count() {
    return this.toArray().length;
  }

  get length() {
    return this.count();
  }

  every(predicate) {
    let res = true;
    let index = 0;

    for (const entry of this.entries()) {
      if (!predicate(entry, index)) {
        res = false;
        break;
      }

      index += 1;
    }

    return res;
  }

  map(predicate) {
    const res = [];

    this.every((entry, index) => {
      res.push(predicate(entry, index));
      return true;
    });

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
