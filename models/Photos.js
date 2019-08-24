var mongoose = require('mongoose')

var Schema = mongoose.Schema

var photoSchema = new Schema({
  img: {
    data: Buffer,
    contentType: String
  },
  title: {
    type: String,
    trim: true
  },
  caption: {
    type: String,
    trim: true
  },
  date_upload: {
    type: Date
  },
  public: {
    type: Boolean
  },
  keyword: {
    type: String
  },
  owner_id: {
    type: String
  },
  album_id: {
    type: String
  }
})

var Photo = mongoose.model('Photos', photoSchema)
module.exports = Photo
