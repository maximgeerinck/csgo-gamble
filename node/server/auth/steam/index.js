/**
 * Created by Maxim on 27/04/2015.
 */
'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('steam', {
    failureRedirect: '/signup',
    session: false
  }))

  .get('/callback', passport.authenticate('steam', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
