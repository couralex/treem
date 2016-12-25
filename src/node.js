export default class Node {

  constructor(name, headers, config, isCollection, depth = 0 ) {
    this._name = name;
    this._config = config;
    this._keys = [];
    this._properties = [];
    this._children = new Map();
    this._data = new Map();
    this._parentData = new Map();
    this._isCollection = isCollection;
    this._nodeName = depth === 0 ? '' : this._name;

    const children = new Map();
    headers.forEach(header => {
      if (header.depth === depth) {
        this._properties.push(header);
        if (header.isKey()) {
          this._keys.push(header.name);
        }
      } else {
        const child = header.nodes[depth];
        if (!children.has(child.name)) {
          children.set(child.name, {isCollection: child.isCollection, headers: []});
        }
        children.get(child.name).headers.push(header);
      }
    });
    children.forEach((child, name) => {
        this._children.set(name, new Node(name, child.headers, config, child.isCollection, depth + 1));
    });
    // if no key, use all properties as keys
    if (this._keys.length === 0) {
      this._keys = this._properties.map(({name}) => name);
      this._reuseObject = this._config.reuseObject === 'key' ? false : this._config.reuseObject;
    } else {
      this._reuseObject = this._config.reuseObject === 'key' ? true : this._config.reuseObject;
    }
  }

  add(row, parentDatum) {
    const arrayKey = this._keys.map(key => row[key]);
    if (!this._reuseObject) {
      arrayKey.push(parentDatum);
    }
    const key = this._config.equalArray(arrayKey);
    if (!this._data.has(key)) {
      let prune = true;
      const newDatum = this._config.wrap.single(this._nodeName);
      // set my properties
      this._properties.forEach(({property, name}) => {
        if (!this._config.prune(row[name])) {
          newDatum[property] = row[name];
          prune = false;
        }
      });
      // set placeholders for my children and call them
      this._children.forEach((node, name) => {
        if (node._isCollection) {
          newDatum[name] = this._config.wrap.collection(this._nodeName);
          node.add(row, newDatum);
          if (newDatum[name].length > 0) prune = false;
        } else {
          newDatum[name] = null;
          node.add(row, newDatum);
          if (newDatum[name] !== null) {
            prune = false;
          } else {
            delete newDatum[name];
          }
        }
      });
      const finalDatum = prune ? null : newDatum;
      // add me to my parent's properties
      this._parentData.set(finalDatum, new Set([parentDatum]));
      this._addToParent(parentDatum, finalDatum);
      // memorize me
      this._data.set(key, finalDatum);
    } else {
      const datum = this._data.get(key);
      let prune = true;
      let currentDatum = null;
      // the cached datum can be null because of prune
      if (datum !== null) {
        prune = false;
        currentDatum = datum;
      } else {
        currentDatum = this._config.wrap.single(this._nodeName);
      }
      this._children.forEach((node, name) => {
        if (node._isCollection) {
          // the cached datum is null so create a new collection
          if (datum === null) {
            currentDatum[name] = this._config.wrap.collection(this._nodeName);
          }
          node.add(row, currentDatum);
          if (currentDatum[name].length > 0) {
            prune = false;
          }
        } else {
          if (datum === null) {
            currentDatum[name] = null;
          }
          let memObject = currentDatum[name];
          //  memObject can be undefined because of prune
          if (memObject === undefined) {
            memObject = null;
          }
          node.add(row, currentDatum);
          // if overwrite is not allowed, use the memObject
          // note : memObject may have changed because of additional rows in sub-collections
          if (!this._config.overwriteObject) {
            currentDatum[name] = memObject;
          }
          if (currentDatum[name] !== null) {
            prune = false;
          } else {
            delete currentDatum[name];
          }
        }
      });
      const finalDatum = prune ? null : currentDatum;
      const parentData = this._parentData.get(finalDatum);
      if (!parentData.has(parentDatum)) {
        this._addToParent(parentDatum, finalDatum);
        parentData.add(parentDatum);
      }
    }
  }

  _addToParent(parentDatum, datum){
    if (datum === null) return;
    if (this._isCollection) {
      parentDatum[this._name].push(datum);
    } else {
      parentDatum[this._name] = datum;
    }
  }
}
