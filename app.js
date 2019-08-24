require('dotenv').config()

var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')

var session = require('express-session')
var MongoStore = require('connect-mongo')(session)

var indexRouter = require('./routes/index')
var loginRouter = require('./routes/login')
var registerRouter = require('./routes/register')
var uploadRouter = require('./routes/upload')
var profileRouter = require('./routes/profile')
var logoutRouter = require('./routes/logout')
var searchRouter = require('./routes/search')
var detailRouter = require('./routes/detail')
var editRouter = require('./routes/edit')

var app = express()

var uri = process.env.MONGOLAB_URI

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/Gumservi')
var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function (next) {
  var admin = {
    fullname: 'admin',
    username: 'admin',
    password: 'admin',
    email: 'admin@example.com'
  }

  await User.findOne({ username: 'admin' }, async function (err, user) {
    if (err) {
      next(err)
    } else if (!user) {
      await User.create(admin)
    }
    console.log('Database connect successfully')
  })
})

// app.use(fileUpload())

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  }),
  cookie: {
    maxAge: 10 * 60 * 1000
  }
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))

app.use('/', indexRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/profile', profileRouter)
app.use('/logout', logoutRouter)
app.use('/upload', uploadRouter)
app.use('/search', searchRouter)
app.use('/detail', detailRouter)
app.use('/edit', editRouter)
app.use('/aboutus', require('./routes/aboutus'))
app.use('/feedback', require('./routes/feedback'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
