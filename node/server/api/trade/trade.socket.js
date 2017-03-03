/**
 * Created by Maxim on 14/06/2015.
 */
'use strict';

var trade = require('./trade.model');

exports.register = function(socket) {
  trade.schema.post('save', function(doc) {
    onSave(socket, doc);
  })
};

function onSave(socket, doc, cb) {
  socket.emit('trade:save', doc);
}
