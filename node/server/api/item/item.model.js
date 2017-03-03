/**
 * Created by Maxim on 28/04/2015.
 */
'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ItemSchema = new Schema({
  appId: {type: String}, //appID --> GAME
  contextId: {type: String}, //contextId??
  assetId: {type: String}, //needed to reference the item
  classId: {type: String}, //classid?
  instanceId: {type: String},
  icon_url: {type: String},
  icon_url_large: {type: String},
  icon_drag_url: {type: String},
  name: {type: String},
  market_hash_name: {type: String},
  market_name: {type: String},
  name_color: {type: String},
  background_color: {type: String},
  type: {type: String},
  tradable: {type: Number},
  marketable: {type: Number},
  commodity: {type: Number},
  fraudwarnings: {type: String},
  descriptions: [{
    type : {type: String},
    value : {type: String},
    app_data : {type: String}
  }],
  owner_descriptions: {type: String},
  market_actions: [{
    name: {type: String},
    link: {type: String}
  }],
  tags: [{
    internal_name : {type: String},
    name : {type: String},
    category : {type: String},
    category_name : {type: String}
  }]
});

// Validate item not already exists
ItemSchema
  .path('classId')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({classId: value}, function(err, item) {
      if(err) throw err;
      if(item) {
        if(self.id === item.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified item already exists.');

module.exports = mongoose.model('Item', ItemSchema);
