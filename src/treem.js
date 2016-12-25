import EqualArray from 'equal-array';
import Header from './header';
import Node from './node';

const DEFAULT_KEY_SYMBOL = '#';
const DEFAULT_COLLECTION_SYMBOL = '+';
const DEFAULT_SEPARATOR_SYMBOL = '.';

export default class Treem {

  constructor(options = {}) {
    this._firstFeed = true;
    const symbols = {
      key: DEFAULT_KEY_SYMBOL,
      collection: DEFAULT_COLLECTION_SYMBOL,
      separator: DEFAULT_SEPARATOR_SYMBOL
    }
    if (options.symbols !== undefined) {
      if (options.symbols.key !== undefined) {
        symbols.key = options.symbols.key;
      }
      if (options.symbols.collection !== undefined) {
        symbols.collection = options.symbols.collection;
      }
      if (options.symbols.separator !== undefined) {
        symbols.separator = options.symbols.separator;
      }
    }
    this._separator = symbols.separator;
    // default options
    this._config = {
      headers: undefined,
      reuseObject: 'key',
      overwriteObject: false,
      root: 'collection',
      wrap: {
        single: () => {return {}},
        collection: () => []
      },
      detect: {
        key: node => {
          return {
            check: node.startsWith(symbols.key),
            name: node.substring(symbols.key.length)
          }
        },
        collection: node => {
          return {
            check: node.startsWith(symbols.collection),
            name: node.substring(symbols.collection.length)
          }
        }
      },
      prune: x => x === undefined || x === null,
      equalArray: new EqualArray()
    }
    this._config.headers = options.headers;
    if (options.reuseObject !== undefined)  {
      this._config.reuseObject = options.reuseObject;
    }
    if (options.overwriteObject !== undefined)  {
      this._config.overwriteObject = options.overwriteObject;
    }
    if (options.root !== undefined)  {
      this._config.root = options.root;
    }
    if (options.wrap !== undefined) {
      if (options.wrap.single !== undefined) {
        this._config.wrap.single = options.wrap.single;
      }
      if (options.wrap.collection !== undefined) {
        this._config.wrap.collection = options.wrap.collection;
      }
    }
    if (options.detect !== undefined) {
      if (options.detect.key !== undefined) {
        this._config.detect.key = options.detect.key;
      }
      if (options.detect.collection !== undefined) {
        this._config.detect.collection = options.detect.collection;
      }
    }
    if (options.prune !== undefined)  {
      if (options.prune !== true) {
        if (options.prune === false) {
          this._config.prune = () => false;
        } else {
          this._config.prune = options.prune;
        }
      }
    }
    if (this._config.root === 'collection') {
      this._data = this._config.wrap.collection('');
    } else {
      this._data = this._config.wrap.single('');
    }
  }

  get data() {
    return this._data;
  }

  feed(rows) {
    if (rows.length === 0) return;

    if (this._root === undefined) {
      let headers = this._config.headers;
      if (headers === undefined) {
        headers = {};
        for (let property in rows[0]) {
          headers[property] = property;
        }
      }
      this._root = this._makeRoot(headers);
    }

    if (this._config.root === 'collection') {
      rows.forEach(row => this._root.add(row, this));
    } else {
      let start = 0;
      if (this._firstFeed) {
        this._root.add(rows[0], this);
        start = 1;
      }
      const memData = this._data;
      for (let i = start; i < rows.length; i++) {
        this._root.add(rows[i], this);
        if (!this._config.overwriteObject) {
          this._data = memData;
        }
      }
    }

    this._firstFeed = false;
  }

  _makeRoot(headers) {
    const columns = [];
    for (let header in headers) {
      columns.push(new Header(header, headers[header], this._separator, this._config.detect));
    }
    return new Node('_data', columns, this._config, this._config.root === 'collection');
  }

}
