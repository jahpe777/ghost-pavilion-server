const path = require('path')
const express = require('express')
const xss = require('xss')
const ShowsService = require('./shows-service')
const moment = require('moment');

const showsRouter = express.Router()
const jsonParser = express.json()

const serializeShow = show => {

  let formatDate = moment(show.date).format('L');

  // let d = new Date(show.date);
  // let month = d.getMonth+1;
  // if(month < 10){ month = "0"+month;}
  
  // let dateString = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

  return ({
  id: show.id,
  date: xss(formatDate),
  city: xss(show.city),
  venue: xss(show.venue),
  created: show.created
})}

showsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ShowsService.getAllShows(knexInstance)
      .then(shows => 
        res.json(shows.map(serializeShow))
      )
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { date, city, venue } = req.body.show
    if((date == null || city == null || venue == null)) {
      return res.status(400).json({
        error: {
          message: `'date', 'city', & 'venue' are required`
        }
      })
    }
    ShowsService.insertShow(
      req.app.get('db'),
      { date, city, venue }
    )
      .then(show => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${show.id}`))
          .json(serializeShow(show))
      })
      .catch(next)
  })

showsRouter
  .route('/:show_id')
  .all((req, res, next) => {
    ShowsService.getById(
      req.app.get('db'),
      req.params.show_id
    )
      .then(show => {
        if (!show) {
          return res.status(404).json({
            error: { message: `Show doesn't exist` }
          })
        }
        res.show = show
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeShow(res.show))
  })
  .delete((req, res, next) => {
    ShowsService.deleteShow(
      req.app.get('db'),
      req.params.show_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = showsRouter