module.exports = {

    'facebookAuth' : {
        'clientID'      : 'ffffff', // App ID
        'clientSecret'  : 'ffff', // App Secret
        'callbackURL'   : 'https://geoip-db.com.com/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=id,name,gender,email',
        'profileFields' : ['id', 'email', 'name', 'gender'] 
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:9999/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'ffffffff',
        'clientSecret'  : 'ffff',
        'callbackURL'   : 'https://geoip-db.com/auth/google/callback'
    }

};