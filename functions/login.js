/** @module authr-login */

var async = require('async');

/**
 * Check a user's password and return the user if it is correct.
 * @function
 * @name Login
 * @param {Object} config - authr configuration object
 * @param {Object} user - username and password supplied by the user. Should be {username: 'foo', password:'bar'}
 * @param {Callback} callback - Execute a callback when finished. Will contain err and user object.
 * @return {Callback}
 */
var Login = function (config, user, callback) {
  async.series([
    function (next) {

      if(user.username.length === 0 || user.password.length === 0) {

        next(config.errmsg.un_and_pw_required, null);
      } else {
        next();
      }
    },
    function (next) {
      config.Adapter.isValueTaken(user, config.user.username, function (foundUser) {

        if(foundUser) {
          next();
        } else {

          next(config.errmsg.username_not_found);
        }
      });
    },
    function (next) {
      config.Adapter.comparePassword(user.password, function (err) {
        next(err);
      });
    },
    function(next){
      if(config.security.email_verification){
        isVerified = config.Adapter.isEmailVerified();
        if(isVerified){

          next();
        } else {

          next({err:config.errmsg.email_address_not_verified, user: config.Adapter.user});
        }
      } else {
        next();
      }
    },
    function (next) {

      if(config.security.max_failed_login_attempts > 0) {
        config.Adapter.isAccountLocked(function (err, locked) {
          next(err);
        });
      } else {
        next();
      }
    },
    function (next) {
      if(config.security.max_failed_login_attempts) {
        config.Adapter.failedAttemptsExpired(function (err, reset) {
          next();
        });
      } else {
        next();
      }
    }
  ], function (error) {
    return callback(error, config.Adapter.user);
  });
};

module.exports = Login;