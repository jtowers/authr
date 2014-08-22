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


var _verifyToken = function(config, token, callback){
  async.waterfall([
    function(next){
      if(token){
        next(null, token);
      } else {
        next(config.errmsg.token_not_found);
      }
    },
    function(token, next){
      config.Adapter.findResetToken(token, function(err, user){
        next(err, user);
      });
    },
    function(user, next){
      var isExpired = config.Adapter.resetTokenExpired(user);
      if(isExpired){
        next(config.errmsg.token_expired, user);
      } else {
        next(null, user);
      }
    }
  ], function(err, user){
    callback(err, user);
  });
};


var _resetPassword = function(config, login, callback){
  async.waterfall([
    function(next){
      config.Adapter.checkCredentials(login, function(err, login){
        next(err, login);
      });
    },
    function(login, next){
      config.Adapter.isValueTaken(login, config.user.username, function(err, user){
        next(err, user);
      });
    },
    function(user, next){
      config.Adapter.hashPassword(login, user, config.user.password, function(err, user){
        next(err, user);
      });
    },
   function(user, next){
     config.Adapter.resetPassword(user, function(err, user){
      next(err, user);
    });
   }
  ], function(err, user){
    callback(err, user);
  });
};

module.exports = {
  generateToken: _generateToken,
  verifyToken: _verifyToken,
  resetPassword: _resetPassword
};