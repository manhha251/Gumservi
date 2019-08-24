var mongoose = require('mongoose')

var Schema = mongoose.Schema

var feedbackSchema = new Schema({
  content: { type: String }
})

var Feedback = mongoose.model('Feedbacks', feedbackSchema)
module.exports = Feedback
