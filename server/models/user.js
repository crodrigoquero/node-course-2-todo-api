const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// any changes in the models below, requires drop database and server to be restarted /reinitiated
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: {
            validator: (value) => { // you can set this prop to "validator.isEmail" for short
                // here we need 3th party library to perform the email validation!
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            require: true
        },
        token: {
            type: String,
            require: true
        }
    }]
});

// we need to OVERRIDE THE MONGOOSE METHOD 'toJSON' in order to set the
// properties we want to send back to the client app, because we don't want to 
// to send the hash values at all
UserSchema.methods.toJSON = function () { // we need o use  regular funtion (not arrow function)
    var user = this;
    var userObject = user.toObject();   // is responsable to covert your mongoose object (user) into javascrit a object (userObject)
                                        // the difference beteen them is that the monggose object has a lot of metadata which defines object structure (schema)
    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () { // UserSchema.methods, is an object and we can add any method we like
    // "this" stores the individual document (user)
    var user = this; //this why we used a regular function, becasuse arrow funcs doesn't binds "this" keyword
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString(); //"we can write {access: access} as  well"
    // abc123 is the secret or private key.
    user.tokens = user.tokens.concat({access, token}); //user.tokens.push({access, token});
    // user.tokens is n array (sse the doc shcema on the to of this module). Now, user doc
    // has three more properties: access, token and _id inside a sub-doc called "tokens"
    return user.save().then(() => {
        return token;
    });
};

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
        decoded =jwt.verify(token, 'abc123');
    } catch (e) {
        // return new Promise((resolve, reject) => {
        //     reject();
        // })
        return Promise.reject();
    }

    return User.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var user = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => { // "resolve" & "reject" params are functions
            // use bcrypt.compare to comapre password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            })
        });
    });
};

// middleware for mongoose
UserSchema.pre('save', function (next)  {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        });
    } else {
        next();
    }
})

var User = mongoose.model('User', UserSchema);

module.exports = {User};