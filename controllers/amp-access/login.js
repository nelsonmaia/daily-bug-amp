/** @license
 * Copyright 2015 - present The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var PaywallAccess = require('../../models/amp-access');

var Auth0Strategy = require('passport-auth0'),
  passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var AUTH_COOKIE_MAX_AGE = 1000 * 60 * 60 * 2; //2 hours

/**
 * The link to the Login Page is configured via the login property in the
 * AMP Access Configuration section.
 *
 * Login Page is simply a normal Web page with no special constraints, other
 * than it should function well as a browser dialog.
 */
router.get('/', function (req, res) {
  console.log("Here we have the READER ID", req.query.rid)


  res.cookie('readerId', req.query.rid, {
    maxAge: AUTH_COOKIE_MAX_AGE  // 2hr
  });

  res.cookie('returnUrl', req.query.return, {
    maxAge: AUTH_COOKIE_MAX_AGE  // 2hr
  });

  res.redirect("login");
}
);

router.get('/login',
  passport.authenticate('auth0',
    { scope: 'openid email profile' })
  , function (req, res) {
    console.log("the callback is here?");
    res.redirect("/");
  });


// Perform the final stage of authentication and redirect to '/user'
router.get('/callback',
  passport.authenticate('auth0', function(err, user, info) {
    console.log("error v2");
    console.log(err);
    console.log(user);
    console.log(info);

  }),
  function (req, res) {

  console.log("the req user is", req)

    // if (!req.user) {
    //   throw new Error('user null');
    // }
    //res.redirect("/user");
    console.log("Checking the coookie", req.cookies.readerId)

    var user = req.user 

    var readerId = req.body.rid;
    var returnUrl = req.cookies.returnUrl;



    // var user = User.findByEmail(user.email);

    // map the user to the AMP Reader ID
    var paywallAccess = PaywallAccess.getOrCreate(req.cookies.readerId);

    paywallAccess.user = user;

    // set user as logged in via cookie
    res.cookie('email', user.email, {
      maxAge: AUTH_COOKIE_MAX_AGE  // 2hr
    });

    console.log("--------- Auth0 Callback Finished -----------")
    res.redirect(returnUrl + '#success=true');

  }
);


router.get('/error', function (req, res) {

  console.log("error is ");
  console.log(req.session.message);

  res.sendStatus(400);

});


router.get('/reset', function (req, res) {
  var readerId = req.query.rid;
  if (!readerId) {
    res.sendStatus(400);
    return;
  }
  res.clearCookie('email');
  PaywallAccess.deleteByReaderId(readerId);
  res.redirect("/");
});

/**
 * Simple user logout.
 */
router.get('/logout', function (req, res) {
  var email = req.cookies.email;
  if (email) {
    PaywallAccess.deleteByEmail(email);
    res.clearCookie('email');
  }
  res.redirect(req.header('Referer') || '/');
});

module.exports = router;
