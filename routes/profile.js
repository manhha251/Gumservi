var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
const fileUpload = require('express-fileupload')

var User = require('../models/Users')
var Photo = require('../models/Photos')
var Album = require('../models/Albums')

router.use(fileUpload())

router.get('/', function (req, res, next) {
  if (req.session.userId) {
    User.findById(req.session.userId)
      .exec(function (error, user) {
        // console.log(user)
        if (error) {
          return next(error)
        } else {
          let query
          if (req.session.username === 'admin') {
            query = {}
          } else {
            query = { owner_id: user._id }
          }
          Photo.find(query, function (err, photos) {
            if (err) {
              return next(err)
            } else if (photos) {
              // console.log(photos.length)
              let array = []
              photos.forEach(element => {
                if (element.img) {
                  array.push({
                    id: element._id,
                    title: element.title,
                    caption: element.caption,
                    contentType: element.img.contentType,
                    data: new Buffer(element.img.data).toString('base64')
                  })
                }
              })
              res.render('profile', { type: 'image', username: user.username, list: array })
            } else {
              res.render('profile', { type: 'image', username: user.username, list: null })
            }
          })
        }
      })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/image', async function (req, res, next) {
  res.redirect('/profile')
})

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

router.get('/album', async function (req, res, next) {
  if (req.session.userId) {
    let query
    if (req.session.username === 'admin') {
      query = {}
    } else {
      query = { owner_id: req.session.userId }
    }
    await Album.find(query, async function (error, albums) {
      if (error) {
        next(error)
      } else if (albums) {
        let array = []
        // const result = await albums.forEach(async element => {
        await asyncForEach(albums, async (element) => {
          let thumbnail = null
          // console.log(element.image_list)
          if (element.image_list.length > 0) {
            // thumbnail.img.data = new Buffer(element.image_list[0].img.data).toString('base64')
            // thumbnail.img.contentType = element.image_list[0].contentType
            console.log('1 ' + element.image_list[0])
            if (element.image_list[0] !== null) {
              await Photo.findById(element.image_list[0], function (error, photo) {
                if (error) {
                  next(error)
                } else {
                  // console.log('2\n' + photo)
                  thumbnail = {
                    data: new Buffer(photo.img.data).toString('base64'),
                    contentType: photo.img.contentType
                  }
                  // console.log(photo.img.data)
                  // console.log('3 ' + thumbnail.contentType)
                }
              })
            }
          }
          await array.push({
            id: element._id,
            name: element.name,
            thumbnail: thumbnail
          })
          // await console.log(array.length)
        })
        // console.log(array.length)
        res.render('profile', { username: req.session.username, type: 'album', list: array })
      } else {
        res.render('profile', { username: req.session.username, type: 'album', list: null })
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/image/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Photo.findById(req.params.id, async function (error, photo) {
      if (error) {
        next(error)
      } else {
        await res.render('edit', {
          type: 'image',
          username: req.session.username,
          id: photo._id,
          title: photo.title,
          caption: photo.caption,
          keyword: photo.keyword,
          public: photo.public,
          dateUpload: photo.date_uload,
          contentType: photo.img.contentType,
          data: new Buffer(photo.img.data).toString('base64')
        })
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/album/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Album.findById(req.params.id, async function (error, album) {
      if (error) {
        next(error)
      } else {
        let thumbnail
        let array = []
        if (album.image_list.length > 0) {
          await Photo.findById(album.image_list[0], function (error, photo) {
            if (error) {
              next(error)
            } else {
              thumbnail = {
                data: new Buffer(photo.img.data).toString('base64'),
                contentType: photo.img.contentType
              }
            }
          })

          await asyncForEach(album.image_list, async (element) => {
            await Photo.findById(element, function (error, photo) {
              if (error) {
                next(error)
              } else {
                array.push({
                  id: photo._id,
                  data: new Buffer(photo.img.data).toString('base64'),
                  contentType: photo.img.contentType
                })
              }
            })
          })
        } else {
          array = null
          thumbnail = null
        }

        await res.render('edit', {
          type: 'album',
          username: req.session.username,
          id: album._id,
          name: album.name,
          description: album.description,
          keyword: album.keyword,
          public: album.public,
          thumbnail: thumbnail,
          list: array
        })
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/update/image/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Photo.findByIdAndUpdate(req.params.id, {
      $set: {
        title: req.query.title,
        caption: req.query.caption,
        keyword: req.query.keyword,
        public: (req.query.visibility === 'public')
      }
    }, async function (error, doc) {
      if (error) {
        await next(error)
      } else {
        await res.redirect('/profile/image/' + req.params.id)
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/update/album/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Album.findByIdAndUpdate(req.params.id, {
      $set: {
        name: req.query.name,
        description: req.query.description,
        keyword: req.query.keyword,
        public: (req.query.visibility === 'public')
      }
    }, async function (error, doc) {
      if (error) {
        await next(error)
      } else {
        await res.redirect('/profile/album/' + req.params.id)
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.post('/update/album/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Album.findById(req.params.id, async function (error, album) {
      if (error) {
        next(error)
      } else {
        let array = []
        let photos = []
        // album.image_list.forEach(element => array.push(element))
        // console.log(req.files)
        if (req.files.images.length > 1) {
          asyncForEach(req.files.images, async (element) => {
            var photo = new Photo()
            photo._id = mongoose.Types.ObjectId()
            photo.title = element.filename
            photo.img.data = element.data
            photo.img.contentType = element.mimetype
            photo.album_id = req.params.id
            photo.owner_id = req.session.userId
            photo.public = album.public
            // photo._id = mongoose.Types.ObjectId()
            array.push(photo._id)
            photos.push(photo)
          })
        } else {
          var photo = new Photo()
          // photo._id = mongoose.Types.ObjectId()
          photo.title = req.files.filename
          photo._id = mongoose.Types.ObjectId()
          photo.img.data = req.files.images.data
          photo.img.contentType = req.files.images.mimetype
          photo.album_id = req.params.id
          photo.owner_id = req.session.userId
          photo.public = album.public
          array.push(photo._id)
          photos.push(photo)
        }
        console.log(array)
        console.log(photos.length)
        await asyncForEach(photos, async (element) => {
          console.log('upload')
          await Photo.create(element, function (error, doc) {
            if (error) {
              next(error)
            }
          })
        })
        await asyncForEach(array, async (element) => {
          console.log(element)
          await Album.findByIdAndUpdate(req.params.id, {
            $addToSet: {
              image_list: element
            } }
          , async function (error, doc) {
            if (error) {
              next(error)
            }
          })
        })
        await res.redirect('/profile/album/' + req.params.id)
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/delete/image/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Photo.findByIdAndDelete(req.params.id, async function (error, doc) {
      if (error) {
        await next(error)
      } else {
        await res.redirect('/profile')
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/delete/album/:id', async function (req, res, next) {
  if (req.session.userId) {
    await Album.findById(req.params.id, async function (error, albums) {
      if (error) {
        next(error)
      } else {
        await asyncForEach(albums.image_list, async (element) => {
          await Photo.findByIdAndDelete(element)
        })
      }
    })
    await Album.findByIdAndDelete(req.params.id, async function (error, doc) {
      if (error) {
        await next(error)
      } else {
        await res.redirect('/profile/album')
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

router.get('/delete/album/image/:id-:imageId', async function (req, res, next) {
  if (req.session.userId) {
    await Album.findById(req.params.id, async function (error, album) {
      if (error) {
        await next(error)
      } else {
        await Photo.findByIdAndDelete(req.params.imageId)
        await Album.findByIdAndUpdate(req.params.id, {
          $pull: { image_list: req.params.imageId }
        })
        res.redirect('/profile/album/' + req.params.id)
      }
    })
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

module.exports = router
