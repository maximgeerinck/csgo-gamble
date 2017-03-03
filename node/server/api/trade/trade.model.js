/**
 * Created by Maxim on 28/04/2015.
 */
'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , deepPopulate = require('mongoose-deep-populate');

var TradeSchema = new Schema({
  issuedOn: {type: Date, default: Date.now},
  issuedBy: {type: Schema.ObjectId, ref: 'User'},
  bot: {type: Schema.ObjectId, ref: 'Bot'},
  items: [{
    price: {type: Number},
    item: {type:Schema.ObjectId, ref: 'Item'}
  }],
  steamTradeId: {type: String},
  _lottery: {type: Schema.ObjectId, ref: 'Lottery'}
});

TradeSchema.plugin(deepPopulate);

module.exports = mongoose.model('Trade', TradeSchema);
