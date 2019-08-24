var express = require('express')
var router = express.Router()

var Photo = require('../models/Photos')
var User = require('../models/Users')
var Album = require('../models/Albums')

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* GET home page. */
router.get('/image/:id', async function (req, res, next) {
  await Photo.findById(req.params.id, async function (error, photo) {
    if (error) {
      next(error)
    } else {
      var doc = {
        id: photo._id,
        title: photo.title,
        caption: photo.caption,
        keyword: photo.keyword,
        contentType: photo.img.contentType,
        data: new Buffer(photo.img.data).toString('base64')
      }

      await User.findById(photo.owner_id, function (error, user) {
        if (error) {
          next(error)
        } else {
          doc.owner = user.username
        }
      })

      res.render('detail', { type: 'image', username: req.session.username, detail: doc })
    }
  })
  // res.render('detail')
})

router.get('/album/:id', async function (req, res, next) {
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

      let owner

      await User.findById(album.owner_id, function (error, user) {
        if (error) {
          next(error)
        } else {
          owner = user.username
        }
      })

      await res.render('detail', {
        type: 'album',
        username: req.session.username,
        id: album._id,
        name: album.name,
        description: album.description,
        keyword: album.keyword,
        public: album.public,
        thumbnail: thumbnail,
        list: array,
        owner: owner
      })
    }
  })
})

module.exports = router
