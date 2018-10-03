var LocalStrategy       = require('passport-local').Strategy;
var FacebookStrategy    = require('passport-facebook').Strategy;
var GoogleStrategy      = require('passport-google-oauth').OAuth2Strategy;


var User = require('../app/models/user');
var configAuth = require('./auth'); // Load the auth (facebook, google) variables


module.exports = function(passport) {
  
    // Serialize user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    
    // LOCAL -----------------------------------------------------------------------------------------------------------------------------------

    //  --- SIGNUP

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {

            req.checkBody('email','Invalid Email. Please provide a valid email.').notEmpty().isEmail();
            req.checkBody('password','Invalid password. Password needs to contain at least 6 characters.').notEmpty().isLength({min:6});
            var errors = req.validationErrors();
            
            // Check for validation erros
            if(errors){
                
                var messages = [];
                
                errors.forEach(function(error){
                    messages.push(error.msg);
                });
                
                return done(null, false, req.flash('message', messages));
            }
            
            //  Whether we're signing up or connecting an account, we'll need to know if the email address is in use.
            User.findOne({ 'local.email' :  email }, function(err, user) {
                
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if there is already a user with that email
                if (user) 
                    return done(null, false, req.flash('message', 'This email address is already taken.'));
                
                //  If we're logged in, we're connecting a new local account.
                if(req.user) {
                    
                    var user            = req.user; // Link existing user
                    user.local.fullname = req.body.fullname;
                    user.local.email    = email;
                    user.local.password = user.generateHash(password);
                    
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user, req.flash('message', 'User ' + req.body.fullname + ' successfully coupled.'));
                    });
                } 
                //  We're not logged in, so we're creating a brand new user.
                else {

                    var user            = new User();
                    user.local.fullname = req.body.fullname;
                    user.local.email    = email;
                    user.local.password = user.generateHash(password);   
                    
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user, req.flash('message', 'User ' + req.body.fullname + ' successfully registered.'));
                    });
                }
            });    
        });
    }));


    // --- LOGIN

    passport.use('local-login', new LocalStrategy({
        // By default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // Allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // Callback with email and password from our form

        User.findOne({ 'local.email' :  email }, function(err, user) {
            
            if (err) 
                return done(err);
            
            // User not found
            if (!user)
                return done(null, false, req.flash('message', 'User not found or password mismatch!')); 

            // Wrong password
            if (!user.validPassword(password))
                return done(null, false, req.flash('message', 'Oops! User not found or password mismatch!'));

            // All is well, return successful user
            //return done(null, user, req.flash('message', 'User ' + user.local.fullname + ' successfully logged in.'));
            return done(null, user);
        });
    }));


    // --- RESET PASSWORD - TODO, still to be implemented

    passport.use('reset', function(req, done) { 

        User.findOne({ 'local.email' :  req.body.email }, function(err, user) {
            
            if (err) 
                return done(err);
            
            // User not found
            if (!user)
                return done(null, false, req.flash('message', 'Email address not found.')); 

            // All is well, return successful user
            return done(null, false, req.flash('message', 'If the email you provided exists, we\'ve sent a password reset link to it.'));
        });
    }); 





    // GOOGLE ----------------------------------------------------------------------------------------------------------------------------------------

    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // Allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, token, refreshToken, profile, done) {

        // Asynchronous
        process.nextTick(function() {

            // Check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // If there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = profile.emails[0].value; // Pull the first email
                            user.preferences.avatar = profile._json.image.url; //profile.photos[0].value;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } 
                    else {

                        var newUser = new User(); // Create a new user

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // Pull the first email
                        newUser.preferences.avatar = profile._json.image.url; //profile.photos[0].value;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            }
            else {

                var user = req.user; // Link existing user

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = profile.emails[0].value; // Pull the first email
                user.preferences.avatar = profile._json.image.url; //profile.photos[0].value;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));




    // FACEBOOK -----------------------------------------------------------------------------------------------------------------------------

    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // Allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    // Facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

        // Asynchronous
        process.nextTick(function() {

            // Check if the user is already logged
            if (!req.user) {

                // Find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    if (err)
                        return done(err);

                    if (user) {

                        // If there is already a userID but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.preferences.avatar = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=150&height=150" + "&access_token=" + token;
                            if (profile.emails !== undefined) { user.facebook.email = profile.emails[0].value ; }

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } 
                    else {

                        // No user found with that facebook id, create him/her
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id;                    
                        newUser.facebook.token = token;                    
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                        newUser.preferences.avatar = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=150&height=150" + "&access_token=" + token;
                        if (profile.emails !== undefined) { newUser.facebook.email = profile.emails[0].value ; }

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } 
            else {
                
                var user = req.user; // Link existing user

                // Update the current users facebook credentials
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.preferences.avatar = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=150&height=150" + "&access_token=" + token;
                if (profile.emails !== undefined) { user.facebook.email = profile.emails[0].value ; }

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

}