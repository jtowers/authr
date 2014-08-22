/** @module authr-delete-account */

var async = require('async');

var Delete = function (config, username, password, callback) {
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
      config.Adapter.comparePassword(password, function(err, user){
        next(err, user);
      });
    },
    function(next){
    config.Adapter.deleteAccount(username, function(err, user){
      callback(err, user);
    });
    }
  ],
    function (err, result) {
      console.log('async done');
      if(err){
        return callback(err, null);
      } else {
        return callback(null, result[result.length-1]);
      }
    });
};

module.exports = Delete;