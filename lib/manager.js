const QuerySet = require('./queryset');


class ObjectsManager {

  constructor() {
    this.set = new Set();
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
    this.set.delete(entry);
  }

  create(entry) {
    this.set.add(entry);
  }

}

module.exports = ObjectsManager;