/**
 * Created by Maxim on 22/06/2015.
 */
'use strict';
var Trade = require('./trade.model.js');

exports.listByUser = function(req, res, next) {
  var userId = req.user._id;
  Trade.find({issuedBy: userId})
    .sort({'issuedOn': -1})
    .deepPopulate('items.item issuedBy', {
      populate: {
        'items.item': {
          select: 'classId icon_url market_hash_name'
        },
        'issuedBy': {
          select: '-_id username displayName steam.avatar steam.avatarmedium'
        }
      }
    })
    .exec(function(err, result){
      res.json(result);
    });
};
