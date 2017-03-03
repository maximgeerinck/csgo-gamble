/**
 * Created by Maxim on 07/07/2015.
 */
'use strict';


var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ChatSchema = new Schema({
  _author: {type: Schema.ObjectId, ref: 'User'},
  message: {type: String},
  composedOn: {type: Date, default: Date.now},
  visible: {type: Boolean, default: true}
});

ChatSchema
  .path('_author')
  .validate(function(author) {
    return author.length;
  }, 'Author cannot be blank');


module.exports = mongoose.model('Chat', ChatSchema);
