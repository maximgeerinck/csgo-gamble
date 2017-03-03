/**
 * Created by Maxim on 22/06/2015.
 */
'use strict';

var express = require('express');
var controller = require('./trade.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/history', auth.isAuthenticated(), controller.listByUser);

module.exports = router;
