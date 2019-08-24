var express = require('express')
var router = express.Router()

var User = require('../models/Users')

const { check, validationResult } = require('express-validator')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('register', { title: 'Register', stylesheet: 'Register.css', status: 'normal' })
})

router.post('/', [
  check('fullname', 'Full name is required').isLength({ min: 1 }),
  check('email').isEmail().withMessage('Please enter a valid email address').trim().normalizeEmail(),
  check('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long')
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error('Password confirm not match')
      } else {
        return value
      }
    }),
  check('username', 'Username is required').isLength({ min: 1 })
], async function (req, res, next) {
  var error = validationResult(req)

  if (!error.isEmpty()) {
    var mess = []
    error.array().forEach(element => {
      mess.push(element.msg)
    })
    console.log(error.array())
    res.render('register', { title: 'Register', stylesheet: 'Register.css', status: 'error', message: mess })
  } else {
    var fullname = req.body.fullname
    var username = req.body.username
    var password = req.body.password
    var passwordConfirm = req.body.passwordConfirm
    var email = req.body.email

    if (fullname && username && email && password && passwordConfirm) {
      await User.findOne({ username: username })
        .exec(async function (_err, user) {
          if (user) {
            error = new Error('Username already exist')
            var mess = [error.message]
            console.log(mess)
            await res.render('register', { title: 'Register', stylesheet: 'Register.css', status: 'error', message: mess })
          } else {
            var userData = {
              fullname: fullname,
              username: username,
              email: email,
              password: password
            }

            await User.create(userData, function (err, user) {
              if (err) {
                return next(err)
              } else {
                return res.redirect('/login')
              }
            })
          }
        })
    }
  }
})

module.exports = router
