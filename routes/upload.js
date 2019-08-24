var express = require('express')
var router = express.Router()
const path = require('path')
var fs = require('fs')
var mongoose = require('mongoose')
const fileUpload = require('express-fileupload')

var Photo = require('../models/Photos')
var Album = require('../models/Albums')

router.use(fileUpload())

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* GET home page. */
router.post('/', async function (req, res, next) {
  if (req.session.userId) {
    if (req.query.type === 'image') {
      let photos = []
      if (req.files.image.length > 1) {
        await asyncForEach(req.files.image, async (element) => {
          var photo = new Photo()
          photo.title = element.filename
          photo.img.data = element.data
          photo.img.contentType = element.mimetype
          photo.owner_id = req.session.userId

          var today = new Date()
          var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
          var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
          var dateTime = date + ' ' + time
          photo.date_upload = dateTime

          photos.push(photo)
        })
        await Photo.collection.insert(photos, function (err, docs) {
          if (err) {
            return next(err)
          } else {
            return res.redirect('/profile')
          }
        })
      } else {
        var photo = new Photo()
        photo.title = req.files.image.filename
        photo.img.data = req.files.image.data
        photo.img.contentType = req.files.image.mimetype
        photo.owner_id = req.session.userId

        var today = new Date()
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
        var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
        var dateTime = date + ' ' + time
        photo.date_upload = dateTime

        await photo.save(function (err) {
          if (err) {
            return next(err)
          } else {
            return res.redirect('/profile')
          }
        })
      }
    } else {
      var albumId = mongoose.Types.ObjectId()
      let photos = []
      let idList = []
      if (req.files.image.length > 1) {
        await asyncForEach(req.files.image, async (element) => {
        // req.files.image.forEach(element => {
          var photo = new Photo()
          photo._id = mongoose.Types.ObjectId()
          photo.title = element.filename
          photo.img.data = element.data
          photo.img.contentType = element.mimetype
          photo.album_id = albumId.toHexString()
          photo.owner_id = req.session.userId
          photo.public = req.body.visibility === 'public'
          photos.push(photo)
          idList.push(photo._id)
        })
      } else {
        await photos.push(new Photo({
          _id: mongoose.Types.ObjectId(),
          title: req.files.image.filename,
          img: {
            data: req.files.image.data,
            contentType: req.files.image.mimetype
          },
          album_id: albumId.toHexString(),
          owner_id: req.session.userId,
          public: req.body.visibility === 'public'
        }))
        idList.push(photos[0]._id)
      }

      var doc = {
        _id: albumId,
        name: req.body.name,
        description: req.body.description,
        keyword: req.body.keyword,
        date_created: new Date(),
        public: req.body.visibility === 'public',
        owner_id: req.session.userId,
        image_list: idList
      }

      await Album.create(doc, async function (error, album) {
        if (error) {
          next(error)
        } else {
          console.log(photos)
          await Photo.insertMany(photos, function (error, docs) {
            if (error) {
              next(error)
            }
          })
          res.redirect('/profile/album')
        }
      })
    }
  } else {
    res.render('login', { title: 'Log In', stylesheet: 'LogIn.css', status: 'error', message: 'Your login section has expired' })
  }
})

module.exports = router
