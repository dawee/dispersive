const clone = require('clone');


class GetterException {

  inlineExpression(expression) {
    return Object.keys(expression).map((name) => {
      `${name}=${expression[name]}`
    }).join(',');
  }

}

class DoesNotExist extends GetterException {

  constructor(expression) {
    this.error = 'DoesNotExist';
    this.message = `Could not find object with (${this.inlineExpression(expression)})`;
  }

}

class MoreThanOneValue extends GetterException {

  constructor(expression) {
    this.error = 'MoreThanOneValue';
    this.message = `Found more than one object with (${this.inlineExpression(expression)})`;
  }

}


class QuerySet {

  constructor(manager, filterExpressions, excludeExpressions) {
    this.filterExpressions = filterExpressions || [];
    this.excludeExpressions = excludeExpressions || []
    this.manager = manager;
  }

  matchExpression(entry, expression) {
    let match = true;

    for (const name of Object.keys(expression)) {
      if (! (name in entry) || entry[name] !== expression[name]) {
        match = false;
        break;
      }
    }

    return match;
  }

  filter(expression) {
    const filterExpressions = clone(this.filterExpressions);
    const excludeExpressions = clone(this.excludeExpressions);

    filterExpressions.push(expression);

    return new QuerySet(this.manager, filterExpressions, excludeExpressions);
  }

  exclude(expression) {
    const filterExpressions = clone(this.filterExpressions);
    const excludeExpressions = clone(this.excludeExpressions);

    excludeExpressions.push(expression);

    return new QuerySet(this.manager, filterExpressions, excludeExpressions);
  }

  *entries() {
    for (const entry of this.manager.values) {
      let match = true;

      for (const expression of this.filterExpressions) {
        if(!this.matchExpression(entry, expression)) {
          match = false;
          break;
        }
      }

      if (!match) continue;

      for (const expression of this.excludeExpressions) {
        if(this.matchExpression(entry, expression)) {
          match = false;
          break;
        }
      }

      if (match) yield entry
    }
  }

  all() {
    return [...this.entries()];
  }

  first() {
    return this.entries().next().value;
  }

  get(expression) {
    const all = this.all();

    if (all[0] === undefined) throw new DoesNotExist(expression);
    if (!all.length > 1) throw new MoreThanOneValue(expression);

    return all[0];
  }

  delete() {
    for (const entry of this.all()) {
      this.manager.delete(entry);
    }
  }

}

module.exports = QuerySet;