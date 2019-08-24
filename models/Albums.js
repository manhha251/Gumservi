var mongoose = require('mongoose')

var Schema = mongoose.Schema

var Photo = mongoose.model('Photos')

var albumSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date_created: {
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
  image_list: [ String ]
})

/* albumSchema.post('save', function (doc) {
  doc.image_list.forEach(element => {
    Photo.findByIdAndUpdate
  })
}) */

var Album = mongoose.model('Albums', albumSchema)
module.exports = Album
