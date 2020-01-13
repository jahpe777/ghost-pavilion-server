const knex = require('knex')
const fixtures = require('./shows-fixtures')
const app = require('../src/app')

describe('Shows Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => db('shows').truncate())

  afterEach('cleanup', () => db('shows').truncate())

  describe('GET /api/shows', () => {
    context(`Given no shows`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/shows')
          .expect(200, [])
      })
    })

    context('Given there are shows in the database', () => {
      const testShows = fixtures.makeShowsArray()

      beforeEach('insert shows', () => {
        return db
          .into('shows')
          .insert(testShows)
      })

      it('gets the shows from the store', () => {
        return supertest(app)
          .get('/api/shows')
          .expect(200, testShows)
      })
    })

    context(`Given an XSS attack show`, () => {
      const { maliciousShow, expectedShow } = fixtures.makeMaliciousShow()

      beforeEach('insert malicious show', () => {
        return db
          .into('shows')
          .insert([maliciousShow])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/shows`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].date).to.eql(expectedShow.date)
            expect(res.body[0].venue).to.eql(expectedShow.venue)
          })
      })
    })
  })

  describe('GET /api/shows/:show_id', () => {
    context(`Given no shows`, () => {
      it(`responds 404 when show doesn't exist`, () => {
        return supertest(app)
          .get(`/api/shows/123`)
          .expect(404, {
            error: { message: `Show doesn't exist` }
          })
      })
    })

    context('Given there are shows in the database', () => {
      const testShows = fixtures.makeShowsArray()

      beforeEach('insert shows', () => {
        return db
          .into('shows')
          .insert(testShows)
      })

      it('responds with 200 and the specified show', () => {
        const showId = 2
        const expectedShow = testShows[showId - 1]
        return supertest(app)
          .get(`/api/shows/${showId}`)
          .expect(200, expectedShow)
      })
    })

    context(`Given an XSS attack show`, () => {
      const { maliciousShow, expectedShow } = fixtures.makeMaliciousShow()

      beforeEach('insert malicious show', () => {
        return db
          .into('shows')
          .insert([maliciousShow])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/shows/${maliciousShow.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedShow.title)
            expect(res.body.description).to.eql(expectedShow.description)
          })
      })
    })
  })

  describe('DELETE /api/shows/:show_id', () => {
    context(`Given no shows`, () => {
      it(`responds 404 whe show doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/shows/123`)
          .expect(404, {
            error: { message: `Show doesn't exist` }
          })
      })
    })

    context('Given there are shows in the database', () => {
      const testShows = fixtures.makeShowsArray()

      beforeEach('insert shows', () => {
        return db
          .into('shows')
          .insert(testShows)
      })

      it('removes the show by ID from the store', () => {
        const idToRemove = 2
        const expectedShows = testShows.filter(bm => bm.id !== idToRemove)
        return supertest(app)
          .delete(`/api/shows/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/shows`)
              .expect(expectedShows)
          )
      })
    })
  })

  describe('POST /api/shows', () => {
    ['date', 'city', 'venue'].forEach(field => {
      const newShow = {
        date: '2020-01-03',
        city: 'Los Angeles, CA',
        venue: 'Los Globos',
      }

      it(`responds with 400 missing '${field}' if not supplied`, () => {
        delete newShow[field]

        return supertest(app)
          .post(`/api/shows`)
          .send(newShow)
          .expect(400, {
            error: { message: `'${field}' is required` }
          })
      })
    })

    it(`responds with 400 invalid 'venue' if null`, () => {
      const newShowInvalidVenue = {
        date: '2020-01-03',
        city: 'Los Angeles, CA',
        venue: 'invalid',
      }
      return supertest(app)
        .post(`/api/shows`)
        .send(newShowInvalidVenue)
        .expect(400, {
          error: { message: 'entering in venue, city, and venue is required' }
        })
    })

    it(`responds with 400 invalid 'city' if not a valid city`, () => {
      const newShowInvalidCity = {
        date: '2020-01-03',
        city: 'invalid',
        venue: 'Los Globos',
      }
      return supertest(app)
        .post(`/api/shows`)
        .send(newShowInvalidCity)
        .expect(400, {
          error: { message: 'entering in venue, city, and venue is required' }
        })
    })

    it('adds a new show to the store', () => {
      const newShow = {
        date: 'test-title',
        city: 'https://test.com',
        venue: 'test description',
      }
      return supertest(app)
        .post(`/api/shows`)
        .send(newShow)
        .expect(201)
        .expect(res => {
          expect(res.body.date).to.eql(newShow.date)
          expect(res.body.city).to.eql(newShow.city)
          expect(res.body.venue).to.eql(newShow.venue)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/shows/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/shows/${res.body.id}`)
            .expect(res.body)
        )
    })

    it('removes XSS attack content from response', () => {
      const { maliciousShow, expectedShow } = fixtures.makeMaliciousShow()
      return supertest(app)
        .post(`/api/shows`)
        .send(maliciousShow)
        .expect(201)
        .expect(res => {
          expect(res.body.date).to.eql(expectedShow.date)
          expect(res.body.venue).to.eql(expectedShow.venue)
        })
    })
  })
})