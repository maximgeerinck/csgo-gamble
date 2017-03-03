/**
 * Created by Maxim on 28/04/2015.
 */
'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var BotSchema = new Schema({
  accountName: {type: String},
  password: {type: String},
  addedOn: {type: String},
  lastLoginState: {type: String},
  authCode: {type: String},
  shaSentryfile: {type: String}
});

module.exports = mongoose.model('Bot', BotSchema);
