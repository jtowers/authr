authr
=====
[![Build Status](https://travis-ci.org/jtowers/authr.svg?branch=master)](https://travis-ci.org/jtowers/authr) [![NPM version](https://badge.fury.io/js/authr.svg)](http://badge.fury.io/js/authr)
## Introduction

authr is an app signup/authentication module inspired by [Lockit](https://github.com/zemirco/lockit/).

It is designed to be framework-independent (i.e., doesn't require Express) and to give you greater control over your user schema and the login process.

This module is in active development.

The core module currently will cover:

1. User signup
2. Email verification
3. User Login
4. Password recovery
5. Account suspension/deletion (todo)

Additional adapters allow you to persist data to different database types. Currently supported types are:

* In-Memory NeDB
* MongoDB


I have plans to add support for:

* sqlite
* mysql
* couchdb
* rethinkdb

## Table of Contents
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
  -[User](#user-configuration)
  - [Security](#security-configuration)
  - [Database](#database-configuration)
  - [Error Messages](#error-message-configuration)
  - [Example](#complete-configuration-file)
- [Verifying an Email Address](#verifying-an-email-address)
- [Logging Users In](#logging-users-in)
- [Password Recovery](#password-recovery)
- [Account Deletion](#account-deletion)

## Basic Usage

1. Install the authr module and the appropriate adapter
`npm install --save authr authr-mongo`

2. Require the core module, create a config hash (or don't and use the defaults), and pass it to a new instance of the module
```
var Authr = require('authr');
var authr = new Authr(); // will use the default options
```
3. Call any of the appropriate methods and handle the response
```
// Example signup
var user = {
    account:{
      username: 'someone@something.com',
      password: 'supersecurepassword'
    }
}
authr.signUp(user, function(err, user){
    if(err){
        // Will contain any signup errors
    }
    console.log(user); // Will contain user object returned from database after insertion.
});
```

## Configuration
There are several categories for configuration options:

### User Configuration
This allows you to customize the schema authr will use to persist and retrieve your user data
The defaults are:
```
var config = {
  user: {
        // The path/field where usernames are stored
        username: 'username',
        
        // The path/field where passwords are stored
        password: 'password',
        
        // The path/field where password reset tokens are stored
        password_reset_token: 'password_reset_token',
        
        // The path/field where the expiration datetime the password reset token is stored
        password_reset_token_expiration: 'password_reset_token_expires',
        
        // The path/field that stores a boolean indicating whether or not the user account is locked
        account_locked: 'account_locked', 
        
        // The path/field where a datetime is stored indicating when an account will be unlocked
        account_locked_until: 'account_locked_until', 
        
        // The path/field where the number of recent failed login attempts are stored
        account_failed_attempts: 'account_failed_attempts', 
        
        // The path/field where the datetime of the last failed attempt is stored
        account_last_failed_attempt: 'account_last_failed_attempt',
        
        // The path/column where the email address is stored. Can be the same as the username
        email_address: 'account_username', 
        
        // The path/column where a boolean indicating whether or not the email address has been verified is stored
        email_verified: 'email_verified', 
        
        // The path/column where the verification hash is stored
        email_verification_hash: 'email_verification_hash', 
        
        // The path/column where the verification expiration datetime is stored
        email_verification_hash_expires: 'email_verification_expires' 
  }
}
```
If you are using MongoDB or the in-memory NeDB, you can use dot notation to specify the path to each field in your schema.

For example, if your schema looks like this:
```
{
  account: {
    username: 'some_username',
    password: 'some_password'
  }
}
```

You could set the username field in your config hash to `{user: {username: 'account.username'}}` to save and retreive the username from the correct location in the document.

### Security Configuration
Allows you to set security options. The defaults are:

```
var config = { 
security: {
      // Should the password be hashed?
      hash_password: true, 
      
      // Set the workfactor for the hash. See: http://wildlyinaccurate.com/bcrypt-choosing-a-work-factor
      hash_salt_factor: 10, 
      
      // Set the number of failed login attempts before the account is locked. Set to 0 to disable
      max_failed_login_attempts: 10, 
      
      // Set the number of minutes before the number of failed attempts reset. 
      reset_attempts_after_minutes: 5, 
      
      // Set the length of time that the account is locked for after the max number of failed attempts is reached
      lock_account_for_minutes: 30, 
      
      // Should email addresses be verified?
      email_verification: true, 
      
      // How long should the email verification code be valid for?
      email_verification_expiration_hours: 12,
      
      // How long should a password reset token be valid for?
      password_reset_token_expiration_hours: 1,
    }
}
```

### Database Configuration
Set the configuration options for the database.

If no database options are supplied, authr will store data in an in-memory nedb instance.

**Note:** Not supplying a database configuration is only suitable for testing.

The data stored there will be removed by nedb every time the app restarts. Do not use this in production.

```
var config = {
  db: {
    type: 'mongodb', // Set the database type. Make sure you have the corresponding adapter installed
    host: 'localhost', // Set the host
    port: 1337, // Set the port
    database_name: 'authr', // Set the database name
    collection: 'users' // Set the collection or table name
  }
}

```

### Error Message Configuration
This option lets you specify the error messages that are returned when authr runs into a signup/authenticaion error.

```
var config = {
    errmsg: {
      username_taken: 'This username is taken Please choose another.',
      email_address_taken: 'This email address is already in use. Please try again.',
      token_not_found: 'This token does not exist. Please try again.', // for email verification and password reset tokens
      token_expired: 'This token has expired. A new one has been generated.',
      un_and_pw_required: 'A username and password are required to log in.',
      username_not_found: 'Your username and/or password is invalid. Please try again.',
      password_incorrect: 'Your username and/or password is invalid. Please try again.',
      account_locked: 'Too many failed attempts. This account will be locked for ##i## minutes.',
      email_address_not_verified: 'Your email address is not verified. Please click the link in the verification email to activate your account.'
    }
}
```

## Complete configuration file

A complete configuration file might look like this:

```
var config = {
  user: {
        username: 'username',
        password: 'password',
        account_locked: 'account_locked',
        account_locked_until: 'account_locked_until',
        account_failed_attempts: 'account_failed_attempts',
        account_last_failed_attempt: 'account_last_failed_attempt',
        email_address: 'email_address',
        email_verified: 'email_verified',
        email_verification_hash: 'email_verification_hash',
        email_verification_hash_expires: 'email_verification_expires',
        password_reset_token: 'password_reset_token',
        password_reset_token_expiration: 'token_expires'
      },
  db: {
    type: 'mongodb',
    host: 'localhost',
    port: 1337,
    database_name: 'authr',
    collection: 'users'
  },
  security: {
        hash_password: true,
        hash_salt_factor: 1, // Hash factor reduced to reduce test times
        password_reset_token_expiration_hours: 1,
        max_failed_login_attempts: 10,
        reset_attempts_after_minutes: 5,
        lock_account_for_minutes: 30,
        email_verification: true,
        email_verification_expiration_hours: 12
      },
  errmsg: {
    username_taken: 'This username is not available. Please try again.'
  }
};
```

## Verifying an Email Address
Call `authr.verifyEmail()` and pass it a signup token to verify a user's email address.

The callback will pass an error (null if there isn't one) and the user that was verified.

```
// Returns the user object for the user that was verified
var Authr = require('authr');
var authr = new Authr('./config.json');
authr.verifyEmail(token_from_signup, function(err, user){
    console.log(user);
});
```

Errors are returned if the token isn't found or if it is expired.

Expired tokens are automatically regenerated.

The error object will include a copy of the user, so you can resend it to the user.

## Logging users in
Call `authr.login()` and pass it a hash with the username and password to log users in.

The hash should be {username: 'someusername', password:'somepassword'}.

```
var Authr = require('authr');
var authr = new Authr() // will use the default options

var credentials = {
    username; 'user@gmail.com',
    password: 'supersecurepassword'
}

authr.login(credentials, function(err, user){
    console.log(err); // will return an error message or object if the login failed.
    console.log(user); // will return the user object, including the id, returned from the database.
});
```

*Note: If you are using the default nedb adapter or the mongodb adapter, the `credentials` hash should follow the same schema defined in the authr config*

After attempting a login, `err` will either contain the relevant error message from the errmsg object in config, or it will return that and any relevant details (e.g., the datetime the account is locked until or the number of remaining failed attempts).

## Password Recovery
authr has a password recovery process that takes place in three steps.

1. The user requests a new password to be sent to their email address

This will generate a new token. Call `authr.createPasswordResetToken()` and pass it an email address.

It can return a token that you can email to the user or communicate via some other channel.

2. The token is verified

Call `authr.verifyPasswordResetToken()` and pass it a token to verify that it exists and is not expired.

This will return the associated user object.

3. Password update

Call `authr.updatePassword()` and pass it a token and a new passowrd to update the user's password.

This will return the associated user object so you can email a confirmation.

Once a password is updated, the token is removed

A full workflow might look something like this:
```
var Authr = require('authr');
var authr = new Authr() // use the default configuration

// capture some request from the user (e.g., via an Express route) to initiate a password request
authr.createPasswordResetToken(email_address, function(err, token){
    // do something to send the user the reset token
});

// pass a token to verify that it exists and get the user back
authr.verifyPasswordResetToken(token, function(err, user){
    // If the token exists and is not expired, prompt the user for a new password

});

// Pass a username and a new password
authr.updatePassword(token, new_password, function(err, user){
    // Send a response to the user to confirm the update. It would probably be a good idea to send an email, too.
});

```
## Account Deletion
Call `authr.deleteAccount()` and pass it a username and password to delete a user account. A password is required to ensure that the account removal is authorized.

This method accepts a callback and will return the user that was removed so that you can perform any cleanup.

## Todo

1. Add support for other adapters
2. Add support for validation of default and custom fields

