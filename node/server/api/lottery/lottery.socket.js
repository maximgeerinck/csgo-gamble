/**
 * Created by Maxim on 14/06/2015.
 */
'use strict';

var Lottery = require('./lottery.model');

exports.register = function(socket) {
  Lottery.schema.post('save', function(doc) {
    Lottery.deepPopulate(doc, 'trades trades.items.item trades.issuedBy', function(err, lottery) {
      onSave(socket, lottery);
    });
  })
};

function onSave(socket, doc, cb) {
  socket.emit('lottery:save', doc);
}
