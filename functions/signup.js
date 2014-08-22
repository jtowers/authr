/** @module authr-signup */
var async = require('async');

/**
 * @function
 * @name Signup
 * @param {Object} config - authr config
 * @param {Object} signup - cser object to be persisted to the database
 * @param {Callback} cb - callback to execute when signup finishes
 * @return {Callback}
 */
var Signup = function (config, signup, cb) {
  var self = this;
  async.series([
    function(next){
     config.Adapter.signupConfig(signup);
      next();
    },
    function(next){
      next(config.Adapter.checkCredentials());
    },
    function (next) {
      config.Adapter.isValueTaken(config.Adapter.signup, config.user.username, function (isTaken) {
          if(!isTaken) {
            next(null, false);
          } else {
            next(config.errmsg.username_taken, true);
          }
      });
    },
    function(next){
      if(config.user.username !== config.user.email_address){
        config.Adapter.isValueTaken(config.Adapter.signup, config.user.email_address, function(isTaken){
          if(!isTaken){
            next(null, false);
          } else {
            next(config.errmsg.email_address_taken);
          }
        });
      } else {
        next();
      }
    },
    function (next) {
      if(config.security.hash_password) {
        config.Adapter.hash_password(function (err, hash) {
          next(err, hash);
        });
      } else {
        next(null);
      }
    },
    function(next){
      if(config.security.max_failed_login_attempts){
        config.Adapter.buildAccountSecurity(config.Adapter.signup);
        next(null);
      }
    },
     function (next) {
      if(config.security.email_verification) {
        config.Adapter.doEmailVerification(config.Adapter.signup,function (err, verification) {
          next(err, verification);
        });
      } else {
        next(null);
      }
    }
  ], function (err, result) {
    if(err) {
      return cb(err);
    } else {
      config.Adapter.saveUser(function (err, user) {
        return cb(err, user);
      });
    }
  });
};

module.exports = Signup;