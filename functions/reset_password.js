/** @module authr-password-reset */
var async = require('async');


/**
 * Generate a password reset token and save it to the db
 * @param {Object} config - authr configuration object
 * @param {String} email - email address to look up
 * @param {Callback} callback - callback to run when finished
 * @return {Callback}
 */
var _generateToken = function(config, email, callback){
  async.waterfall([
    function(next){
      if(email){
        next(null);
      } else {
        next(config.errmsg.un_and_pw_required);
      }
    },
    function(next){
      config.Adapter.getUserByEmail(email, function(err, user){
       if(user){
         next(null, user);
       } else {
         next(config.errmsg.email_address_not_found);
       }
      });
    },
    function(user, next){
      config.Adapter.generateToken(20, function(err, token){
        next(err, user, token);
      });
    },
    function(user, token, next){
     config.Adapter.savePWResetToken(user, token, function(err, user){
       next(err, user);
     });
    }
  ],function(err, user){
    callback(err, user);
  });
};


var _verifyToken = function (config, token, callback) {
  async.series([
    function (next) {
      if(token) {
        next();
      } else {
        next('Missing or malformed token.');
      }
    },
    function (next) {
      config.Adapter.findResetToken(token, function (err, user) {
        next(err);
      });
    },
    function (next) {
      var isExpired = config.Adapter.resetTokenExpired();
      if(isExpired) {
        next(config.errmsg.token_expired);
      } else {
        next();
      }
    }
  ], function (err, result) {
    if(err) {
      callback(err);
    } else {
      callback(null, config.Adapter.user);
    }
  });
};

var _resetPassword = function(config, username, password, callback){
  async.series([
    function(next){
     
      if(!username || !password){
        next(config.errmsg.un_and_pw_required);
      } else {
        next();
      }
    },
    function(next){
      config.Adapter.getUserByUsername(username, function(err, user){
        next(err, user);
      });
    },
    function(next){
      config.Adapter.hash_new_password(password, function(err, hash){
        next(err, hash);
      });
    },
    function(next){
     
      config.Adapter.resetPassword(function(err, user){
        next(err, user);
      });
    }
  ], function(err, result){
   
    callback(err, config.Adapter.user);
  });
};

module.exports = {
  generateToken: _generateToken,
  verifyToken: _verifyToken,
  resetPassword: _resetPassword
};