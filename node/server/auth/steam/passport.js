/**
 * Created by Maxim on 27/04/2015.
 */
exports.setup = function (User, config) {
  var passport = require('passport')
    , SteamStrategy = require('passport-steam').Strategy;

  passport.use(new SteamStrategy({
      returnURL: config.steam.returnURL,
      realm: config.steam.realm,
      apiKey: config.steam.apiKey
    },
    function(identifier, profile, done) {

      User.findOne({username: profile._json.personaname}, function(err, user) {
        if(!user) {
          User.create({
            provider: 'steam',
            role: 'user',
            username: profile._json.personaname,
            displayName: profile._json.displayName,
            steam: profile._json
          }, function(err, user) {
            console.log("User: " + user.username + " has been created");
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });

      //User.findByOpenID({ openId: identifier }, function (err, user) {
      //  return done(err, user);
      //});
    }
  ));
};
