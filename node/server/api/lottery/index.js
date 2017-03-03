/**
 * Created by Maxim on 30/04/2015.
 */
'use strict';

var express = require('express');
var controller = require('./lottery.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/active', controller.active);
router.get('/:lotteryId', controller.show);
router.get('/', controller.all);

module.exports = router;
