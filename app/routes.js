var User            = require('../app/models/user');

module.exports = function(app, passport) {

 
    // LANDING PAGES ------------------------------------------------------------------------------------------------

    // Signup landing page
    app.get('/', function(req, res) {
        res.render('signup.ejs', { message: req.flash('message') });
    });
    
    // Signup landing page
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('message') });
    });

    // Login landing page
    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('message') });
    });

    // Recover landing page
    app.get('/recover', function(req, res) {
        res.render('recover.ejs', { message: req.flash('message') });
    });

    // Reset landing page
    app.get('/reset', function(req, res) {
        res.render('reset.ejs', { message: req.flash('message') });
    });

    // Dashboard landing page
    app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('dashboard.ejs', {
            message: req.flash('message'), 
            user : req.user
        });
    });
    

    // SIGNUP, LOGIN, LOGOUT AND RESET PASSWORD ----------------------------------------------------------------------------------------------


    // LOCAL ------

    // Email signup
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // Email login
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/login', // redirect to login
        failureFlash : true // allow flash messages
    }));


    // GOOGLE -----

    // Google authentication and login
    app.get('/auth/google', passport.authenticate('google', { 
        scope : ['profile', 'email'] 
    }));

    // Google - Callback after Google has authenticated the user
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true     
    }));


    // FACEBOOK -----

    // Facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { 
        scope : ['public_profile', 'email']
    }));
  
    // Facebook - Callback after Facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true 
    }));


    // LOGOUT & RESET -----

    // Password reset
    app.post('/reset', function(req, res, next) {
        
    });
    
    // Logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
    

    // LINK ACCOUNTS -------------------------------------------------------------------------------------------------------------------


    // Local
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('message') });
    });

    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', 
        failureRedirect : '/connect/local', 
        failureFlash : true
    }));

    // Facebook
    app.get('/connect/facebook', passport.authorize('facebook', { 
      scope : ['public_profile', 'email'] 
    }));

    // Facebook - Callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/dashboard',
            failureRedirect : '/',
            failureFlash : true
    }));
  
    // Google 
    app.get('/connect/google', passport.authorize('google', 
        { scope : ['profile', 'email'] 
    }));

    // Google - Callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/dashboard',
            failureRedirect : '/',
            failureFlash : true
    }));


    // UNLINK ACCOUNTS -------------------------------------------------------------------------------------------------------------
    

    // Local 
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/dashboard');
		});
	});

	// Facebook 
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/dashboard');
		});
	});

	// Google
	app.get('/unlink/google', function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/dashboard');
		});
	});

}





function isLoggedIn(req, res, next) {

    // If user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // If user isn't,  redirect him/her to index
    res.redirect('/');
}
