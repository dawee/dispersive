const REVERSED = 1;

/*
 * Filter
 */

const createFilterPredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] === expression[key])
);

const getFilterPredicate = expression => (
  typeof expression === 'function' ? expression : createFilterPredicate(expression)
);

/*
 * Exclude
 */

const createExcludePredicate = expression => (
  entry => Object.keys(expression).every(key => entry[key] !== expression[key])
);

const getExcludePredicate = expression => (
  typeof expression === 'function' ? expression : createExcludePredicate(expression)
);

/*
 * Mixin
 */

class SortedEntriesGenerator {

  constructor(queryset, sortComparator) {
    this.sortComparator = sortComparator;
    this.parent = queryset.parent;
  }

  * entries() {
    for (const [, entry] of this.parent.toArray().sort(this.sortComparator).entries()) {
      yield entry;
    }
  }

}

const withQueries = Base => class extends Base {

  constructor({QuerySetConstructor, parent = null, predicate = null, sortComparator = null}) {
    super({parent, QuerySetConstructor});
    this.predicate = predicate;
    this.sortGenerator = sortComparator ? new SortedEntriesGenerator(this, sortComparator) : null;
  }

  validate(entry) {
    return !this.predicate || this.predicate(entry);
  }

  getFallbackSource(source = null) {
    return source || this.parent;
  }

  * entries() {
    const source = this.getFallbackSource(this.sortGenerator);

    for (const entry of source.entries()) {
      if (this.validate(entry)) yield entry;
    }
  }

  filter(expression) {
    return this.clone({predicate: getFilterPredicate(expression)});
  }

  exclude(expression) {
    return this.clone({predicate: getExcludePredicate(expression)});
  }

  sort(sortComparator) {
    return this.clone({sortComparator});
  }

  reverse() {
    return this.clone({sortComparator: () => REVERSED});
  }

};

module.exports = {
  withQueries,
  getFilterPredicate,
  getExcludePredicate,
};
