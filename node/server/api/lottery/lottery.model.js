/**
 * Created by Maxim on 28/04/2015.
 */
'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
    , deepPopulate = require('mongoose-deep-populate');

var LotterySchema = new Schema({
  trades: [{type:Schema.ObjectId, ref: 'Trade'}], //because many-to-one
  winner: {type: Schema.ObjectId, ref: 'User'},
  winChance: {type: Number},
  winnerTradeofferId: {type: Number},
  startedOn: {type: Date, default: Date.now},
  endedOn: {type: Date},
  active: {type: Boolean, default: false},
  itemsKept: [{type: Schema.ObjectId, ref: 'Item'}],
  itemsAwarded: [{type: Schema.ObjectId, ref: 'Item'}],
  bot: {type: Schema.ObjectId, ref: 'Bot'},
  errorRewarding: {type: Boolean},
  errorMessage: {type: String}
});

LotterySchema.methods = {
  addTrade: function(trade) {
    this.trades.push(trade);
  },
  countTotalPrice: function() {
    this.deepPopulate('trades trades.items.item trades.issuedBy', function(err, lottery) {
      var totalPrice = 0;
      for (var i = 0; i < lottery.trades.length; i++) {
        totalPrice += lottery.trades[i].price;
      }
      return totalPrice;
    });
  }
  ,
  //retrieveItems: function(callback) {
  //  this.model.populate(this, 'trades.items.item', function(err, _lottery){
  //    var items = [];
  //    for(var i = 0; i < _lottery.trades.length; i++) {
  //      for(var j = 0; j < _lottery.trades[i].items.length; j++) {
  //        _lottery.trades[i].items[j].item.price = _lottery.trades[i].items[j].price;
  //        items.push(_lottery.trades[i].items[j].item);
  //      }
  //    }
  //
  //    callback(items);
  //  });
  //},
  /**
   * Retrieves an array of items with their price, sorted by price ASC
   * @param callback, the callback function to be executed when the method was handled
   */
  retrieveItemsWithPrice: function(callback) {
    this.deepPopulate('trades trades.items.item trades.issuedBy', function(err, lottery){
      var items = [];
      for(var i = 0; i < lottery.trades.length; i++) {
        for(var j = 0; j < lottery.trades[i].items.length; j++) {
          if(typeof lottery.trades[i].items[j] === 'undefined' || !lottery.trades[i].items[j]) {
            continue;
          }
          var item = lottery.trades[i].items[j].item;
          item.price = lottery.trades[i].items[j].price;
          items.push(item);
        }
      }

      items.sort(function(a, b) {
        if(a.price < b.price) return -1;
        if(a.price > b.price) return 1;
        return 0;
      });

      callback(items);
    });
  },
  depositsPerUser: function(callback) {

    this.deepPopulate('trades trades.items.item trades.issuedBy', function(err, lottery){
      var pricesDeposited = [], priceDeposited = 0, totalPrice = 0, amountOfItems = 0;
      for(var i = 0; i < lottery.trades.length; i++) {
        amountOfItems += lottery.trades[i].items.length;
        priceDeposited = 0;
        for(var j = 0; j < lottery.trades[i].items.length; j++) {
          priceDeposited += lottery.trades[i].items[j].price;
        }
        totalPrice += priceDeposited;

        //prices deposited per user
        pricesDeposited.push({"price": priceDeposited, "user": lottery.trades[i].issuedBy});
      }
      callback(pricesDeposited, amountOfItems);
    });
  },
  end: function(callback) {
    this.active = false;
    this.endedOn = new Date();

    this.save(function(err, lottery){

      if(err) {
        console.log(err);
        return;
      }

      if(typeof callback != "undefined") {
        callback(lottery);
      }
    });
  },
  setWinner: function(winner, winChance, callback) {
    this.winner = winner;
    this.winChance = winChance;

    this.save(function(err, lottery){

      if(err) {
        console.log(err);
        return;
      }

      if(typeof callback != "undefined") {
        callback(err, lottery);
      }
    });
  }
};

LotterySchema.plugin(deepPopulate);

module.exports = mongoose.model('Lottery', LotterySchema);
