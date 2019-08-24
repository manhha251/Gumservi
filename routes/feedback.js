var express = require('express')
var router = express.Router()

var Feedback = require('../models/Feedbacks')
/* GET home page. */
router.post('/', async function (req, res, next) {
  console.log(req.body.feedback)
  await Feedback.create({ content: req.body.feedback }, function (error, docs) {
    if (error) {
      return (error)
    }
  })
  next()
})

router.get('/', async function (req, res, next) {
  next()
})

module.exports = router
