
class Tree {

  constructor() {
    this._leafs = new Set();
    this._trees = new Set();
  }

  get tree() {
    return [...this.dump()];
  }

  *dump() {
    for (const leaf of this._leafs) {
      yield leaf;
    }

    for (const name of this._trees) {
      for (const branch of this[name].dump()) {
        yield `${name}.${branch}`;
      }
    }
  }

  *children() {
    for (const leaf of this._leafs) {
      yield [leaf, this[leaf]];
    }

    for (const tree of this._trees) {
      yield [tree, this[tree]];
    }
  }

  registerAll(subs) {
    for (const name of Object.keys(subs)) {
      this.register(name, subs[name]);
    }
  }

  register(names, sub) {
    let name = null;

    if (typeof names === 'object') return this.registerAll(names);

    name = names;

    if (name in this) return;

    if (!!sub && sub instanceof this.constructor) {
      const tree = sub;

      this[name] = tree;
      this._trees.add(name);
      return tree;
    }

    return this._register(name, sub || {});
  }

  forget(name) {
    if (this._trees.has(name)) {
      this._trees.delete(name);
      delete this[name];
    } else if (this._leafs.has(name)) {
      this._leafs.delete(name);
      delete this[name];
    }
  }

}

module.exports = Tree;
