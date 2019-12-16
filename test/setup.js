process.env.TZ = 'UTC'
require('dotenv').confog()
const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest