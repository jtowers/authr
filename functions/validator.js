/** @module authr-signup */
var async = require('async');
var validate = require('validate.js');

JSON.flatten = function (data) {
    var result = {};

    function recurse(cur, prop) {
        if(Object(cur) !== cur) {
            result[prop] = cur;
        } else if(Array.isArray(cur)) {
            for(var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if(l === 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for(var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if(isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};

validate.validators.unique = function (val, options, key, attributes) {
    var obj = {
        'searchfor': val
    };
    options.Adapter.isValueTaken(obj, val, function (err, isTaken) {
        if(isTaken) {
            return 'this value is taken';
        } else {
            return null;
        }
    });

};

/**
 * @param {Object} config - authr config
 * @param {Object} signup - cser object to be persisted to the database
 * @param {validateCallback} callback - callback to execute when signup finishes
 */
var Validate = function (config, signup, callback) {
    var constraints = {};
    var current_constraint;
    var signup_flat = JSON.flatten(signup);
    if(config.custom) {
        for(var constraint in config.custom) {
            if(config.custom[constraint].path) {
                current_constraint = constraints[config.custom[constraint].path] = {};
            } else {
                current_constraint = constraints[constraint] = {};
            }
            for(var rule in config.custom[constraint]) {
                if(rule != 'path') {
                    if(rule == 'unique') {
                        var opts = {
                            Adapter: config.Adapter
                        };
                        current_constraint[rule] = opts;
                    } else {
                        current_constraint[rule] = config.custom[constraint][rule];
                    }
                }
            }
        }
        return(callback(validate(signup_flat, constraints), signup));
    } else {
        return callback(new Error('Custom field definitions are required for validation'));
    }
};

module.exports = Validate;