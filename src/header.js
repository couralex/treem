export default class Header {

  constructor(name, alias, separator, detect) {
    this._name = name;
    this._elements = alias.split(separator);
    this._depth = this._elements.length - 1;
    this._property = this._elements[this._depth];
    const isKey = detect.key(this._property);
    if (isKey.check) {
      this._isKey = true;
      this._property = isKey.name;
    } else {
      this._isKey = false;
    }
    this._nodes = [];
    for (let i = 0; i < this._elements.length - 1; i++) {
      const collection = detect.collection(this._elements[i], alias);
      const name = collection.check ? collection.name : this._elements[i];
      const isCollection = collection.check;
      this._nodes.push({name, isCollection});
    }
  }

  get name() {
    return this._name;
  }

  get depth() {
    return this._depth;
  }

  get property() {
    return this._property;
  }

  get nodes() {
    return this._nodes;
  }

  isKey() {
    return this._isKey;
  }
}
