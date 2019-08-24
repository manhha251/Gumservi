var express = require('express')
var router = express.Router()

var Album = require('../models/Albums')
var Photo = require('../models/Photos')

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  var option = req.query.filter
  var type = req.query.type
  var search = req.query.search
  if (type === 'image') {
    let query
    switch (option) {
      case 'title':
        query = { title: { $regex: new RegExp(search) } }
        break
      case 'caption':
        query = { caption: { $regex: new RegExp(search) } }
        break
      case 'keyword':
        query = { keyword: { $regex: new RegExp(search) } }
        break
    }

    if (!req.session || req.session.username !== 'admin') {
      query.public = true
    }
    await Photo.find(query, async function (error, photos) {
      if (error) {
        next(error)
      } else if (photos) {
        let array = []
        await asyncForEach(photos, async (element) => {
        // photos.forEach(element => {
          array.push({
            id: element._id,
            title: element.title,
            contentType: element.img.contentType,
            data: new Buffer(element.img.data).toString('base64')
          })
        })
        await res.render('result', { title: 'Search result', type: 'image', username: req.session.username, list: array })
      } else {
        await res.render('result', { title: 'Search result', type: 'image', username: req.session.username, list: null })
      }
    })
  } else {
    let query
    switch (option) {
      case 'title':
        query = { name: { $regex: new RegExp(search) } }
        break
      case 'caption':
        query = { description: { $regex: new RegExp(search) } }
        break
      case 'keyword':
        query = { keyword: { $regex: new RegExp(search) } }
        break
    }

    if (!req.session || req.session.username !== 'admin') {
      query.public = true
    }
    await Album.find(query, async function (error, albums) {
      if (error) {
        next(error)
      } else if (albums) {
        let array = []
        console.log(albums)
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
        await res.render('result', { title: 'Search result', type: 'album', username: req.session.username, list: array })
      } else {
        await res.render('result', { title: 'Search result', type: 'album', username: req.session.username, list: null })
      }
    })
  }
})

module.exports = router
