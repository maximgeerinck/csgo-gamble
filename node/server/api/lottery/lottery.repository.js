/**
 * Created by Maxim on 16/06/2015.
 */
'use strict';


var mongoose = require('mongoose');
var Lottery = require('./lottery.model.js');

var LotteryRepository = function() {

  var self = this;

  self.Model = Lottery;

  self.findActivePopulated = function(cb) {
    self.Model
      .findOne({active: true})
      .deepPopulate('trades trades.items.item trades.issuedBy')
      .exec(function(err, lottery) {
        if (err) {
          console.log(err);
          return;
        }
        cb(lottery);
      });
  };
};

LotteryRepository.prototype.findActive = function(cb) {
  this.Model
    .findOne({active: true})
    .exec(function(err, lottery){
      if(err){
        console.log(err);
        return;
      }
      cb(lottery);
    })
};

LotteryRepository.prototype.findDepositsPerUser = function(lottery, callback) {
  lottery
    .depositsPerUser(function(deposits, items){
      callback(deposits, items);
    });
};

module.exports = new LotteryRepository;
