require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const emailsRouter = require('../emails/emails-router')

const app = express()

const morganOption = (NODE_ENV === 'production' ? 'tiny' : 'common')

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())

app.use('/api/emails', emailsRouter)

module.exports = app