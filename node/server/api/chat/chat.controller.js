/**
 * Created by Maxim on 07/07/2015.
 */
'use strict';

var Chat = require('./chat.model');

var PER_PAGE = 10;

/**
 * returns a list of chats defined by a given page number
 * @param req
 * @param res
 */
exports.index = function(req, res) {

  var page = (typeof req.params.page != 'undefined') ? req.params.page : 1;

  Chat
    .find()
    .sort({'composedOn': 'desc'})
    .populate({path: '_author', select: 'username displayName steam.avatar steam.avatarmedium'})
    .skip((page - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .exec(function(err, chats) {
      if(err) { console.log(err); res.send(500); }
      res.json(200, chats);
    });
};

exports.create = function(req, res) {
  var message = req.body.message;
  var user = req.user._id;

  console.log(req.user);

  Chat
    .create({
      '_author': user,
      'message': message
    }, function(err, chat){
      if(err){ console.log(err); res.send(500); }
      res.send(200, chat);
    })
};
