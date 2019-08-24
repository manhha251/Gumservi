var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', async function (req, res, next) {
  if (req.session.userId) {
    res.render('edit')
  } else {
    var error = new Error('Your login section has expired. Please login again')
    error.status = 401
    await next(error)
  }
})

module.exports = router
