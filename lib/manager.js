const QuerySet = require('./queryset');


class ObjectsManager {

  constructor() {
    this.values = [];
  }

  filter(expression) {
    return new QuerySet(this).filter(expression);
  }

  exclude(expression) {
    return new QuerySet(this).exclude(expression);
  }

  all() {
    return new QuerySet(this).all();
  }

  first() {
    return new QuerySet(this).first();
  }

  get(expression) {
    return new QuerySet(this).get(expression);
  }

  delete(entry) {
    const index = this.values.indexOf(entry);

    if (index > -1) this.values.splice(index, 1);
  }

  create(entry) {
    this.values.push(entry);
  }

}

module.exports = ObjectsManager;