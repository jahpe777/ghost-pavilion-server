const path = require('path')
const express = require('express')
const xss = require('xss')
const EmailsService = require('./emails-service')

const emailsRouter = express.Router()
const jsonParser = express.json()

const serializeSubscriber = subscriber => ({
  id: subscriber.id,
  email: xss(subscriber.email),
})

emailsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    EmailsService.getAllEmails(knexInstance)
      .then(emails => 
        res.json(emails.map(serializeSubscriber))
      )
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { email } = req.body
    
    if(email == null) {
      return res.status(400).json({
        error: {
          message: `Supply a valid email`
        }
      })
    }
    EmailsService.insertEmail(
      req.app.get('db'),
      { email: email }
    )
      .then(email => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${email.id}`))
          .json(serializeSubscriber(email))
      })
      .catch(next)
  })

emailsRouter
  .route('/:email_id')
  .all((req, res, next) => {
    EmailsService.getById(
      req.app.get('db'),
      req.params.email_id
    )
      .then(email => {
        if (!email) {
          return res.status(404).json({
            error: { message: `Email doesn't exist` }
          })
        }
        res.email = email
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeSubscriber(res.email))
  })
//   .delete((req, res, next) => {
//     EmailsService.deleteFolder(
//       req.app.get('db'),
//       req.params.folder_id
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })
//   .patch(jsonParser, (req, res, next) => {
//     const { name } = req.body
//     const folderToUpdate = { name }

//     if(!folderToUpdate) {
//       return res.status(400).json({
//         error: {
//           message: 'Body must contain a new folder name'
//         }
//       })
//     }

//     EmailsService.updateFolder(
//       req.app.get('db'),
//       req.params.folder_id,
//       folderToUpdate
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })

module.exports = emailsRouter