var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', async function (req, res, next) {
  if (req.session.userId) {
    res.redirect('/profile')
  } else {
    await res.render('index', { title: 'Gumservi', stylesheet: 'Welcome.css' })
  }
})

module.exports = router
