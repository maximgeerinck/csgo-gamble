/**
 * Created by Maxim on 07/07/2015.
 */
'use strict';

var Chat = require('./chat.model');

exports.register = function(socket) {
  Chat.schema.post('save', function(chat) {
    onSave(socket, chat);
  })
};

function onSave(socket, doc, cb) {
  socket.emit('chat:save', doc);
}
