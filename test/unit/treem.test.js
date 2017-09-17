import {expect} from 'chai';
import Treem from '../../src/treem';

describe('Treem', function() {
  describe('options: default', function() {
    it('should handle root properties', function () {
      const rows = [{a: 1, b: 2}, {a: 3, b: 4}];
      const expected = [{a: 1, b: 2}, {a: 3, b: 4}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should handle nested child', function () {
      const rows = [{a: 1, 'b.c': 2}, {a: 3, 'b.c': 2}];
      const expected = [{a: 1, b: {c: 2}}, {a: 3, b: {c: 2}}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should reuse objects with same key', function () {
      const rows = [{a: 1, 'b.#c': 2, 'b.d': 4}, {a: 3, 'b.#c': 2, 'b.d': 5}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data[0].b).to.equal(treem.data[1].b);
    });
    it('should handle collection children', function () {
      const rows = [{a: 1, '+b.c': 2}, {a: 1, '+b.c': 4}];
      const expected = [{a: 1, 'b': [{c: 2}, {c: 4}]}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should keep the first occurence of a single object', function () {
      const rows = [{a: 1, 'b.c': 2}, {a: 1, 'b.c': 4}];
      const expected = [{a: 1, 'b': {c: 2}}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should keep the first occurence of a single object and grow the sub collections', function () {
      const rows = [{a: 1, 'b.c': 2, 'b.+d.e': 5}, {a: 1, 'b.c': 2, 'b.+d.e': 6}, {a: 1, 'b.c': 4, 'b.+d.e': 7}];
      const expected = [{a: 1, 'b': {c: 2, d: [{e: 5}, {e: 6}]}}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should remove null and undefined values', function () {
      const rows = [{a: 1, d: null, '+b.c': null}, {a: 1, d: null, '+b.c': 4}, {a: 1, d: null,'+b.c': undefined}];
      const expected = [{a: 1, 'b': [{c: 4}]}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should remove null root', function () {
      const rows = [{a: null}];
      const expected = [];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should remove null child', function () {
      const rows = [{a: 1, 'b.c': null}];
      const expected = [{a: 1}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should remove null child even if there is non null child instance after', function () {
      const rows = [{a: 1, 'b.c': null}, {a: 1, 'b.c': 2}];
      const expected = [{a: 1}];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should return an empty array if there is no data', function () {
      const rows = [];
      const treem = new Treem();
      treem.feed(rows);
      expect(treem.data).to.deep.equal([]);
    });
    it('should add data to the same root when feed is called multiple times', function () {
      const rows1 = [{a: 1, '+b.c': 2}];
      const rows2 = [{a: 1, '+b.c': 4}];
      const expected1 = [{a: 1, 'b': [{c: 2}]}];
      const expected2 = [{a: 1, 'b': [{c: 2}, {c: 4}]}];
      const treem = new Treem();
      treem.feed(rows1);
      expect(treem.data).to.deep.equal(expected1);
      treem.feed(rows2);
      expect(treem.data).to.deep.equal(expected2);
    });
    it('should reset data when fill is called', function () {
      const rows1 = [{a: 1, '+b.c': 2}];
      const rows2 = [{a: 1, '+b.c': 4}];
      const expected1 = [{a: 1, 'b': [{c: 2}]}];
      const expected2 = [{a: 1, 'b': [{c: 4}]}];
      const treem = new Treem();
      treem.fill(rows1);
      expect(treem.data).to.deep.equal(expected1);
      treem.fill(rows2);
      expect(treem.data).to.deep.equal(expected2);
    });
  });
  describe('options: {prune: false}', function() {
    it('should keep null and undefined values', function () {
      const rows = [{a: 1, d: null, '+b.c': null}, {a: 1, d: null, '+b.c': 4}, {a: 1, d: null,'+b.c': undefined}];
      const expected = [{a: 1, d: null, 'b': [{c: null}, {c: 4}, {c: undefined}]}];
      const treem = new Treem({prune: false});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
  describe('options: {prune: true}', function() {
    it('should remove null and undefined values', function () {
      const rows = [{a: 1, d: undefined, '+b.c': null}, {a: 1, d: undefined, '+b.c': null}, {a: 1, d: undefined,'+b.c': null}];
      const expected = [{a: 1, 'b': []}];
      const treem = new Treem({prune: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should remove null objects with empty collection', function () {
      const rows = [{a: null, '+b.c': null}, {a: null, '+b.c': null}];
      const expected = [];
      const treem = new Treem({prune: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
  describe('options: {prune: <callback>}', function() {
    it('should use the callback to prune the data', function () {
      const rows = [{a: 1, d: 2, '+b.c': 3}, {a: 1, d: 2,'+b.c': 5}, {a: 1, d: 4, '+b.c': 2}];
      const expected = [{a: 1, b: [{c: 3}, {c: 5}]}, {a: 1, d: 4, b: []}];
      const treem = new Treem({prune: element => element === 2});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
  describe("options: {root: 'single'}", function() {
    it('should define the root data as a single object', function () {
      const rows = [{a: 1, 'b.c': 2}, {a: 1, 'b.c': 4}];
      const expected = {a: 1, 'b': {c: 2}};
      const treem = new Treem({root: 'single'});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should keep the first occurence of the root object', function () {
      const rows = [{a: 1, 'b.c': 2}, {a: 2, 'b.c': 4}];
      const expected = {a: 1, 'b': {c: 2}};
      const treem = new Treem({root: 'single'});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should return an empty object if there is no data', function () {
      const rows = [];
      const treem = new Treem({root: 'single'});
      treem.feed(rows);
      expect(treem.data).to.deep.equal({});
    });
    it('should remove null root even if there is valid root instance after', function () {
      const rows = [{a: null}, {a: 1}];
      const expected = {};
      const treem = new Treem({root: 'single'});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should add data to the same root when feed is called multiple times', function () {
      const rows1 = [{a: 1, '+b.c': 2}];
      const rows2 = [{a: 1, '+b.c': 4}];
      const rows3 = [{a: 2, '+b.c': 6}];
      const expected1 = {a: 1, 'b': [{c: 2}]};
      const expected2 = {a: 1, 'b': [{c: 2}, {c: 4}]};
      // overwriteObject is false
      const expected3 = {a: 1, 'b': [{c: 2}, {c: 4}]};
      const treem = new Treem({root: 'single'});
      treem.feed(rows1);
      expect(treem.data).to.deep.equal(expected1);
      treem.feed(rows2);
      expect(treem.data).to.deep.equal(expected2);
      treem.feed(rows3);
      expect(treem.data).to.deep.equal(expected3);
    });
  });
  describe("options: {overwriteObject: true}", function() {
    it('should overwrite objects', function () {
      const rows = [{a: 1, 'b.c': 2}, {a: 1, 'b.c': 4}];
      const expected = [{a: 1, 'b': {c: 4}}];
      const treem = new Treem({overwriteObject: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should keep the last valid object even if the last instance is null', function () {
      const rows = [
        {a: 1, 'b.c': null, 'b.d.e': null},
        {a: 1, 'b.c': 1, 'b.d.e': 2},
        {a: 1, 'b.c': null, 'b.d.e': null}
      ];
      const expected = [{a: 1, b: {c: 1, d:{e: 2}}}];
      const treem = new Treem({overwriteObject: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
  describe("options: {root: 'single', overwriteObject: true}", function() {
    it('should overwrite the root object', function () {
      const rows = [{a: 1, 'b.c': 2}, {a: 2, 'b.c': 4}];
      const expected = {a: 2, 'b': {c: 4}};
      const treem = new Treem({root: 'single', overwriteObject: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should overwrite root after root null instance', function () {
      const rows = [{a: null}, {a: 1}];
      const expected = {a: 1};
      const treem = new Treem({root: 'single', overwriteObject: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should keep the root even if the last instance is null', function () {
      const rows = [{a: null}, {a: 1}, {a: null}];
      const expected = {a: 1};
      const treem = new Treem({root: 'single', overwriteObject: true});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should add data to the same root or change root when feed is called multiple times', function () {
      const rows1 = [{a: 1, '+b.c': 2}];
      const rows2 = [{a: 1, '+b.c': 4}];
      const rows3 = [{a: 2, '+b.c': 6}];
      const expected1 = {a: 1, 'b': [{c: 2}]};
      const expected2 = {a: 1, 'b': [{c: 2}, {c: 4}]};
      const expected3 = {a: 2, 'b': [{c: 6}]};
      const treem = new Treem({root: 'single', overwriteObject: true});
      treem.feed(rows1);
      expect(treem.data).to.deep.equal(expected1);
      treem.feed(rows2);
      expect(treem.data).to.deep.equal(expected2);
      treem.feed(rows3);
      expect(treem.data).to.deep.equal(expected3);
    });
  });
  describe('options: {reuseObject: false}', function() {
    it('should create a new object', function () {
      const rows = [{a: 1, 'b.#c': 2, 'b.d': 4}, {a: 3, 'b.#c': 2, 'b.d': 5}];
      const treem = new Treem({reuseObject: false});
      treem.feed(rows);
      expect(treem.data[0].b).to.not.equal(treem.data[1].b);
    });
  });
  describe('options: {headers: <object>}', function() {
    it('should use the provided headers instead of the first row', function () {
      const headers = {'a' : 'a'};
      const rows = [{a: 1, 'b.c': 2}, {a: 2, 'b.c': 4}];
      const expected = [{a: 1}, {a: 2}];
      const treem = new Treem({headers});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
    it('should use the provided aliases', function () {
      const headers = {'a' : 'a', 'b' : 'b.c'};
      const rows = [{a: 1, 'b': 2}, {a: 2, 'b': 4}];
      const expected = [{a: 1, b: {c: 2}}, {a: 2, 'b': {c: 4}}];
      const treem = new Treem({headers});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
  describe('options: {wrap: single: <callback>}', function() {
    it('should wrap objects', function () {
      class Wrapper {}
      const rows = [{a: 1, 'b.c': 2}, {a: 2, 'b.c': 4}];
      const treem = new Treem({wrap: {single: () => new Wrapper()}});
      treem.feed(rows);
      expect(treem.data[0]).to.be.an.instanceof(Wrapper);
      expect(treem.data[0].b).to.be.an.instanceof(Wrapper);
    });
  });
  describe('options: {wrap: collection: <callback>}', function() {
    it('should wrap collection', function () {
      class Wrapper {constructor() {this._arr = []} push(el) {this._arr.push(el)}}
      const rows = [{a: 1, '+b.c': 2}, {a: 1, '+b.c': 4}];
      const treem = new Treem({wrap: {collection: () => new Wrapper()}});
      treem.feed(rows);
      expect(treem.data).to.be.an.instanceof(Wrapper);
      expect(treem.data._arr[0].b).to.be.an.instanceof(Wrapper);
    });
  });
  describe('options: {detect: key: <callback>}', function() {
    it('should detect keys and transform them', function () {
      const rows = [{a: 1, 'b.*c': 2}, {a: 2, 'b.*c': 2}];
      const expected = [{a: 1, b: {c: 2}}, {a: 2, b: {c: 2}}];
      const treem = new Treem({detect: {key: node => { return {
        check: node.startsWith('*'),
        name: node.substring(1)
      }}}});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
      expect(treem.data[0].b).to.equal(treem.data[1].b);
    });
  });
  describe('options: {detect: collection: <callback>}', function() {
    it('should detect collection and transform them', function () {
      const rows = [{a: 1, '*b.c': 2}, {a: 1, '*b.c': 3}];
      const expected = [{a: 1, b: [{c: 2}, {c: 3}]}];
      const treem = new Treem({detect: {collection: node => { return {
        check: node.startsWith('*'),
        name: node.substring(1)
      }}}});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
  describe('options: {symbols: <object>}', function() {
    it('should use the provided symbols', function () {
      const rows = [{a: 1, '!b/*c': 2}, {a: 2, '!b/*c': 2}];
      const expected = [{a: 1, b: [{c: 2}]}, {a: 2, b: [{c: 2}]}];
      const treem = new Treem({symbols: {
        key: '*',
        collection: '!',
        separator: '/'
      }});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
      expect(treem.data[0].b[0]).to.equal(treem.data[1].b[0]);
    });
    it('should use the default symbols if the object is empty', function () {
      const rows = [{a: 1, '+b.#c': 2}, {a: 2, '+b.#c': 2}];
      const expected = [{a: 1, b: [{c: 2}]}, {a: 2, b: [{c: 2}]}];
      const treem = new Treem({symbols: {}});
      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
      expect(treem.data[0].b[0]).to.equal(treem.data[1].b[0]);
    });
  });
});
