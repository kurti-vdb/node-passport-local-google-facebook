var mongoose          = require('mongoose');
var bcrypt            = require('bcrypt-nodejs');
var randtoken         = require('rand-token');
var uniqueRandomArray = require('unique-random-array');


// Helper function - Generate a 4 digit pincode
generatePin = function() {
    return Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
}

// Helper function - Generate a random avatar
generateAvatar = function() {
    var rand = uniqueRandomArray(["aa.png", "ab.png", "ac.png", "ad.png","ae.png", "af.png", "ag.png", "ah.png","ai.png", "aj.png", "ak.png", "al.png"]);
    return rand();
}



// Datamodel for our user
var userSchema = mongoose.Schema({

    account          : {
        firstname    : String,
        lastname     : String,
        phone        : String,
        company      : String,
        location     : String,
        locale       : String,
        avatar       : { type: String, default: generateAvatar()}   
    },
    company          : {
        name         : String,
        website      : String,
        taxID        : String
    },
    security         : {
        lastlogon    : Date,
        ip           : String
    },
    api              : {
        keys         : { type: Array, default: [ { apikey : { subscriptionType: String, usage: String, billingPeriod: String }}] }
    },
    billing          : {
        invoices     : { type: Array, default: [ { bill : { amount: Number, billingperiod: String }}] },
        payments     : { type: Array, default: [ { bill : { amount: Number, billingperiod: String }}] }
    },
    local            : {
        fullname     : String,
        email        : String,
        password     : String,
        active       : { type: Boolean, default: false },
        created      : { type: Date, default: Date.now },
        modified     : { type: Date, default: Date.now },
        pincode      : { type: Number, default: generatePin(), attempts: { type: Number, default: 0 }},
        token        : { type: String, default: () => randtoken.generate(64), expires: { type: Date, default: () => Date.now() + 7*24*60*60*1000 }} // 7 days valid
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email        : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});


// Generate a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


// Create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);