/**
 * Created by Maxim on 30/04/2015.
 */
'use strict';

var Lottery = require('./lottery.model');
var Item = require('./../item/item.model');
var User = require('./../user/user.model');
var config = require('../../config/environment');

exports.active = function(req, res) {
  Lottery
    .findOne({active: true}, '-itemsAwarded -itemsKept -__v -bot')
    .sort({active: 'desc', startedOn: 'desc'})
    .deepPopulate('trades.items.item trades.issuedBy winner', {
      populate: {
        'trades.items.item': {
          select: 'classId icon_url market_hash_name'
        },
        'trades.issuedBy': {
          select: 'username displayName steam.avatar steam.avatarmedium'
        },
        'winner': {
          select: '-__v -accessToken -role'
        }
      }
    })
    .exec(function(err, lotteries){
      res.json(200, lotteries);
    })
};

exports.all = function(req, res) {
  Lottery
    .find({}, '-itemsAwarded -itemsKept -__v -bot')
    .sort({active: 'desc', startedOn: 'desc'})
    .deepPopulate('trades trades.items.item trades.issuedBy', {
      populate: {
        'trades': {
          select: '-_lottery -__v -bot'
        },
        'trades.items.item': {
          select: 'classId icon_url market_hash_name'
        },
        'trades.issuedBy': {
          select: '-_id username displayName steam.avatar steam.avatarmedium'
        }
      }
    })
    .exec(function(err, lotteries){
      res.json(200, lotteries);
    })
};

exports.show = function(req, res, next) {
  var lotteryId = req.params.lotteryId;
  Lottery
    .findById(lotteryId, '-itemsAwarded -itemsKept -__v -bot')
    .sort({active: 'desc', startedOn: 'desc'})
    .deepPopulate('trades.items.item trades.issuedBy winner', {
      populate: {
        'trades.items.item': {
          select: 'classId icon_url market_hash_name'
        },
        'trades.issuedBy': {
          select: 'username displayName steam.avatar steam.avatarmedium'
        },
        'winner': {
          select: '-__v -accessToken -role'
        }
      }
    })
    .exec(function(err, lottery){
      res.json(200, lottery);
    })
};
