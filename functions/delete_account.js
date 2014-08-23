/** @module authr-delete-account */

var async = require('async');

var Delete = function (config, login, callback) {
  async.waterfall([
    function(next){
      config.Adapter.checkCredentials(login, function(err,login){
        next(err, login);
      });
    },
    function(login, next){
      config.Adapter.isValueTaken(login,config.user.username, function(err, user){
        if(user){
          next(err, user, login);
        } else {
          next(config.errmsg.password_incorrect);
        }
        
      });
    },
    function(user,login, next){
      config.Adapter.comparePassword(user,login, function(err, user){
        next(err, user);
      });
    },
    function(user, next){
    config.Adapter.deleteAccount(user, function(err, user){
      next(err, user);
    });
    }
  ],
    function (err, user) {
      callback(err,user);
    });
};

module.exports = Delete;