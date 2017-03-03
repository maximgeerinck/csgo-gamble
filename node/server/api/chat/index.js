/**
 * Created by Maxim on 30/04/2015.
 */
'use strict';

var express = require('express');
var controller = require('./chat.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:page', controller.index);
router.get('/', controller.index);
router.post('/create', auth.isAuthenticated(), controller.create);

module.exports = router;
