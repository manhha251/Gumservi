var express = require('express')
var router = express.Router()
var bcrypt = require('bcrypt')

var User = require('../models/Users')

/* GET users listing. */
router.get('/', async function (req, res, next) {
  if (req.session.userId) {
    await res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'login', username: req.session.username, password: req.session.password })
  } else {
    await res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'login', username: null, password: null })
  }
})

router.post('/', async function (req, res, next) {
  const username = req.body.username
  const password = req.body.password
  console.log(username + ':' + password)
  if (username && password) {
    await User.findOne({ username: username })
      .exec(async function (error, user) {
        if (error) {
          next(error)
        } else if (!user) {
          return res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Username does not exist' })
        }
        await bcrypt.compare(password, user.password, async function (_err, result) {
          if (result === true) {
            req.session.userId = user._id
            req.session.username = username
            req.session.password = password
            req.session.status = 'login'
            return res.redirect('/profile')
          } else {
            return res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Wrong password' })
          }
        })
      })
  }
})

module.exports = router
