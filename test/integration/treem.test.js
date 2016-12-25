import {expect} from 'chai';
import Treem from '../../src/treem';
import inflection from 'inflection';

describe('Treem', function() {
  describe('with inflection', function() {
    it('should identify plural forms to detect collections', function() {
      const rows = [
        {name: 'x', 'children.name': 'a'},
        {name: 'x', 'children.name': 'b'},
      ];
      const expected = [{
        name: 'x', children:[{name: 'a'}, {name: 'b'}]
      }];

      const treem = new Treem({
        detect: {
          collection: node => {
            return {
              check: node === inflection.pluralize(node),
              name: node
            }
          }
        }
      });

      treem.feed(rows);
      expect(treem.data).to.deep.equal(expected);
    });
  });
});
