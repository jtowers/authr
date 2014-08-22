/** @module authr-password-reset */
var async = require('async');

var _generateToken = function (config, email, callback) {
  var token;
  async.series([
    function (next) {
      if(email) {
        next();
      } else {
        next('Please enter an email address');
      }
    },
    function (next) {

      config.Adapter.getUserByEmail(email, function (err, user) {

        if(err) {
          next(config.errmsg.username_not_found);
        } else {
          next();
        }
      });
    },
    function (next) {

      config.Adapter.generateToken(20, function (err, _token) {
        token = _token;
        next(err, token);
      });
    },
    function (next) {
      config.Adapter.savePWResetToken(token, function (err, user) {
        next(err, user);
      });
    }
  ], function (err, result) {

    if(err) {
      callback(err);
    } else {
      callback(null, token);
    }
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