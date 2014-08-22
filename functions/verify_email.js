/** @module authr-verify */
var async = require('async');

Verify = function(config, token, callback){
  async.series([
    function(next){
      config.Adapter.findVerificationToken(token, function(err, user){
        next(err);
      });
    },
    function(next){
      var isExpired = config.Adapter.emailVerificationExpired();
      if(isExpired){
       
        config.Adapter.doEmailVerification(config.Adapter.user, function(err, user){
          next({err:config.errmsg.token_expired, user: user});
        });
      } else {
     
        next(null);
      }
    },
    function(next){
      config.Adapter.verifyEmailAddress(function(err, user){
        next(err, user);
      });
    }
  ],function(err, result){
    return callback(err, config.Adapter.user);
  });
};

module.exports = Verify;