
class Tree {

  constructor() {
    this._leafs = new Set();
    this._trees = new Set();
  }

  dump() {
    let models = Array.from(this._leafs);

    for (const name of this._trees) {
      models = models.concat(`${name}.${this[name].models}`);
    }

    return models;
  }

  register(name, sub) {
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
