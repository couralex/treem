# treem
[![Build Status](https://travis-ci.org/couralex/equal-array.svg?branch=master)](https://travis-ci.org/couralex/treem)
[![Coverage Status](https://coveralls.io/repos/github/couralex/treem/badge.svg?branch=master)](https://coveralls.io/github/couralex/treem?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

treem converts flat data (like SQL rows) into an object tree. The tree structure is determined by the columns' names.

## Example

Flat data :
```js
const movies = [{
  name: 'Rogue one',
  '+actors.firstName': 'Felicity',
  '+actors.lastName': 'Jones'
}, {
  name: 'Rogue one',
  '+actors.firstName': 'Diego',
  '+actors.lastName': 'Luna'
}, {
  name: 'Star Wars: The Force Awakens',
  '+actors.firstName': 'Harrison',
  '+actors.lastName': 'Ford'
}, {
  name: 'Star Wars: The Force Awakens',
  '+actors.firstName': 'Daisy',
  '+actors.lastName': 'Ridley'
}];
```

Result :
```js
[ { name: 'Rogue one',
    actors:
     [ { firstName: 'Felicity', lastName: 'Jones' },
       { firstName: 'Diego', lastName: 'Luna' } ] },
  { name: 'Star Wars: The Force Awakens',
    actors:
     [ { firstName: 'Harrison', lastName: 'Ford' },
       { firstName: 'Daisy', lastName: 'Ridley' } ] } ]
```

## Features

- high performance
- compatible with multi-language pluralizations to detect collections
- optionnal pruning of null/undefined values or customized values
- handle primary keys
- inject a custom Model class into the object tree
- aliasing of columns' names

## Installation

npm install treem

## Usage

```js
import Treem from 'treem';
// ES5: var Treem = require('treem').default;

const rows = [{
  name: 'Rogue one',
  '+actors.firstName': 'Felicity'
  ...
}];

const treem = new Treem();
treem.feed(rows);
treem.data === [{
  name: 'Rogue one',
  actors: [{
    firstName: 'Felicity'
  ...
]];
```

## Principle

treem takes flat data to produce an object tree.
Flat data can be :
- an array of objects : each object property is a column
- an array of arrays : a header must be provided : [Example](https://github.com/couralex/treem/wiki/Flat-data-as-arrays-of-arrays)

Orthogonally, flat data can be :
- uniform : each row have the same columns / structure
- non uniform : columns can be different : [Example](https://github.com/couralex/treem/wiki/Non-uniform-flat-data)

The structure of the tree is determined by a convention on the columns' naming. The convention defines, by default, 3 symbols :
- separator as `.` : defines children
  example : `book.author.name`
- collection as `+` : defines an array instead of a single object. Note : pluralization can also be used to detect collection : [Example](https://github.com/couralex/treem/wiki/Pluralization-as-collection-detection)
  example : `+movies.+actors`
- key as `#` : defines keys of the object. If no key is provided, all properties of the object are considered as a key. Defining a key improves performances and allows object reuse (see the reuseObject option).
  example : `actor.#id`

The result produced by treem can be :
- an array (by default)
- an object (by setting the option: {root: 'single'})


## Options

```js
const treem = new Treem({
  symbols: {
    key: '#',
    collection: '+',
    separator: '.'
  },
  root: 'collection',
  prune: true,
  reuseObject : true,
  overwriteObject : false,
  headers: {
    id: 'id',
    name: 'name',
    petName: 'pet:name'
  },
  wrap: {
    single: node => new Model(),
    collection: node => new ModelCollection()
  },
  detect: {
    key: node => { return {
      check: node === 'id',
      name : 'id'
    }},
    collection: node => { return {
      check: node.startsWith('*'),
      name : node.substring(1)
    }},   
  }
});
```

### `symbols`
*accepted values: object with collection, key, and separator properties*

Redefines the symbols used by treem to detect collection,  key, and children.
Example:
```js
new Treem({
  symbols: {
    key: '#',
    collection: '+',
    separator: '.'
  }
})
```

### `prune`
*accepted values: true (default), false or a callback*

Removes null or undefined elements. prune can also accept a callback. Example :
```js
new Treem({
  prune: element => element === undefined || element === null
})
```

### `root`
*accepted values: 'collection' (default) or 'single'*

Defines treem.data as either an array or an object.


### `reuseObject`
*accepted values: 'key' (default), true or false*

Reuses an object if multiple instances of it are detected. Example :
```js
const movies = [{
  name: 'Rogue one',
  '+actors.#id': 1,
  '+actors.firstName': 'Felicity',
  '+actors.lastName': 'Jones'
}, {
  name: 'Rogue one',
  '+actors.#id': 2,
  '+actors.firstName': 'Anthony',
  '+actors.lastName': 'Daniels'
}, {
  name: 'Star Wars: The Force Awakens',
  '+actors.#id': 3,
  '+actors.firstName': 'Harrison',
  '+actors.lastName': 'Ford'
}, {
  name: 'Star Wars: The Force Awakens',
  '+actors.#id': 2,
  '+actors.firstName': 'Anthony',
  '+actors.lastName': 'Daniels'
}];
```
Here the actor 'Anthony Daniels' appear in both movies. treem will use the same object instead of duplicate it.

ReuseObject can have 3 values :
- 'key' : objects with same keys are reused
- true : objects with same values are reused
- false : duplicates objects


### `overwriteObject`
*accepted values: false (default) or true*

Overwrites single objects if values are different on subsequent rows.

### `headers`
*accepted values: object*

Defines the columns headers and aliases. Useful if you can't change the columns' names.
If this option is not defined, headers are taken from the first row of the flat data.
Example:

```js
const movies = [{
  name: 'Rogue one',
  id: 1,
  firstName: 'Felicity',
  lastName: 'Jones'
...
}]
```

new Treem({
  headers: {
    name: 'name',
    id: '+actors.#id',
    firstName: '+actors.firstName',
    lastName: '+actors.lastName',
  }
});


### `wrap`
*accepted values: {single: function, collection: function}*

Wraps custom classes about single elements and collection elements.
The function to be provided takes the current node as a parameter and returns an instance of the custom class.
The custom class for single elements shall let its properties be set and gotten.
The custom class for collection elements shall have a push function.

[See the wiki](https://github.com/couralex/treem/wiki/Custom-class-wrapper) for an example.


### `detect`
*accepted values: {key: function, collection: function}*

Defines a custom way to detect keys and collections by providing a callback.
The callback takes the current node as a parameter and returns an object with 2 properties :
- check : a condition that returns true if the node is a key or collection
- name: the name of the node to be put in the result object

[See the wiki](https://github.com/couralex/treem/wiki/Pluralization-as-collection-detection) for an example with pluralization.
