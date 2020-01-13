const knex = require('knex')
const fixtures = require('./emails-fixtures')
const app = require('../src/app')

describe('Emails Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => db('subscribers').truncate())

  afterEach('cleanup', () => db('subscribers').truncate())

  describe('GET /api/emails', () => {
    context(`Given no emails`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/emails')
          .expect(200, [])
      })
    })

    context('Given there are emails in the database', () => {
      const testEmails = fixtures.makeEmailsArray()

      beforeEach('insert emails', () => {
        return db
          .into('subscribers')
          .insert(testEmails)
      })

      it('gets the emails from the store', () => {
        return supertest(app)
          .get('/api/emails')
          .expect(200, testEmails)
      })
    })

    context(`Given an XSS attack email`, () => {
      const { maliciousEmail, expectedEmail } = fixtures.makeMaliciousEmail()

      beforeEach('insert malicious email', () => {
        return db
          .into('subscribers')
          .insert([maliciousEmail])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/emails`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].email).to.eql(expectedEmail.email)
          })
      })
    })
  })

  describe('GET /api/emails/:email_id', () => {
    context(`Given no emails`, () => {
      it(`responds 404 when email doesn't exist`, () => {
        return supertest(app)
          .get(`/api/emails/123`)
          .expect(404, {
            error: { message: `Email doesn't exist` }
          })
      })
    })

    context('Given there are emails in the database', () => {
      const testEmails = fixtures.makeEmailsArray()

      beforeEach('insert emails', () => {
        return db
          .into('subscribers')
          .insert(testEmails)
      })

      it('responds with 200 and the specified email', () => {
        const emailId = 2
        const expectedEmail = testEmails[emailId - 1]
        return supertest(app)
          .get(`/api/emails/${emailId}`)
          .expect(200, expectedEmail)
      })
    })

    context(`Given an XSS attack email`, () => {
      const { maliciousEmail, expectedEmail } = fixtures.makeMaliciousEmail()

      beforeEach('insert malicious email', () => {
        return db
          .into('subscribers')
          .insert([maliciousEmail])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/emails/${maliciousEmail.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.email).to.eql(expectedEmail.email)
          })
      })
    })
  })

  describe('DELETE /api/emails/:email_id', () => {
    context(`Given no emails`, () => {
      it(`responds 404 when email doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/emails/123`)
          .expect(404, {
            error: { message: `Email doesn't exist` }
          })
      })
    })

    context('Given there are emails in the database', () => {
      const testEmails = fixtures.makeEmailsArray()

      beforeEach('insert emails', () => {
        return db
          .into('subscribers')
          .insert(testEmails)
      })

      it('removes the email by ID from the store', () => {
        const idToRemove = 2
        const expectedEmails = testEmails.filter(bm => bm.id !== idToRemove)
        return supertest(app)
          .delete(`/api/emails/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/emails`)
              .expect(expectedEmails)
          )
      })
    })
  })

  describe('POST /api/emails', () => {
    ['email'].forEach(field => {
      const newEmail = {
        email: 'lauren@gmail.com',
      }

      it(`responds with 400 missing valid email`, () => {
        delete newEmail[field]

        return supertest(app)
          .post(`/api/emails`)
          .send(newEmail)
          .expect(400, {
            error: { message: `Supply a valid email` }
          })
      })
    })

    it(`responds with 400 invalid 'email' if not a valid email`, () => {
      const invalidEmail = {
        email: null,
      }
      return supertest(app)
        .post(`/api/emails`)
        .send(invalidEmail)
        .expect(400, {
          error: { message: `Supply a valid email` }
        })
    })

    it('adds a new email to the store', () => {
      const newEmail = {
        email: 'lauren@gmail.com',
      }
      return supertest(app)
        .post(`/api/emails`)
        .send(newEmail)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(newEmail.email)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/emails/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/emails/${res.body.id}`)
            .expect(res.body)
        )
    })

    it('removes XSS attack content from response', () => {
      const { maliciousEmail, expectedEmail } = fixtures.makeMaliciousEmail()
      return supertest(app)
        .post(`/api/emails`)
        .send(maliciousEmail)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(expectedEmail.email)
        })
    })
  })
})