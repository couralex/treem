import {expect} from 'chai';
import Treem from '../../src/treem';
import mysql from 'mysql2';
import pg from 'pg';

describe('Treem', function() {
  const expected = [{
    ID: 1,
    Name: 'Rogue one',
    Actor: [
      {ID: 1, FirstName: 'Felicity', LastName: 'Jones' },
      {ID: 2, FirstName: 'Diego', LastName: 'Luna'}
    ]
  }, {
    ID: 2,
    Name: 'Star Wars: The Force Awakens',
    Actor: [
      {ID: 3, FirstName: 'Harrison', LastName: 'Ford'},
      {ID: 4, FirstName: 'Daisy', LastName: 'Ridley'}
    ]
  }];

  describe('with mysql', function () {
    const SQL = `
      SELECT Movie.ID,
        Movie.Name,
        Actor.ID AS \`+Actor.ID\`,
        Actor.FirstName AS \`+Actor.FirstName\`,
        Actor.LastName AS \`+Actor.LastName\`
      FROM Movie
        INNER JOIN MovieActor ON Movie.ID = MovieActor.Movie_ID
        INNER JOIN Actor ON MovieActor.Actor_ID = Actor.ID
      `;
    it('should handle result rows', function (done) {
      const treem = new Treem();
      const connection = mysql.createConnection({
        host:'mysql',
        user: 'root',
        password: 'couralex',
        database: 'moviedb'
      });
      connection.query(SQL, function (err, results, fields) {
          treem.feed(results);
          expect(treem.data).to.deep.equal(expected);
          done();
        }
      );
    });
  });
  describe('with postgresql', function (done) {
    const SQL = `
      SELECT "Movie"."ID",
        "Movie"."Name",
        "Actor"."ID" AS "+Actor.ID",
        "Actor"."FirstName" AS "+Actor.FirstName",
        "Actor"."LastName" AS "+Actor.LastName"
      FROM "Movie"
        INNER JOIN "MovieActor" ON "Movie"."ID" = "MovieActor"."Movie_ID"
        INNER JOIN "Actor" ON "MovieActor"."Actor_ID" = "Actor"."ID"
      `;
    it('should handle result rows', function (done) {
      const treem = new Treem();
      const client = new pg.Client("postgres://couralex:couralex@postgres:5432/moviedb");
      client.connect(function (err) {
        client.query(SQL, function (err, result) {
          treem.feed(result.rows);
          expect(treem.data).to.deep.equal(expected);
          done();
        });
      });
    });
  });
});
