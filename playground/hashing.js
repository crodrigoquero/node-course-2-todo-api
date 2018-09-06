const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

bcrypt.genSalt(10,(err, salt) => { // 1st param: the bigger, the safer
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

var hashedPassword = '$2a$10$8dMcWc6zi8YsiOqCmKcyK.h/1Cytb6CwC7LeJwLQOch94AjreU3rq';
bcrypt.compare(password, hashedPassword, (err, res) => {
    
});

// var data = {
//     id: 10
// };

// var token = jwt.sign(data, '123abc');
// console.log(token);

// var decoded = jwt.verify(token, '123abcaa');
// console.log('decoded', decoded);

// var message = 'I am user number 3';
// var hash = SHA256(message).toString(); // encrypts the message var value

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//     id: 4
// };

// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// token.data.id = 5; //this line simulates "man in the middle" (hacker) changing the data

// var resultHash = SHA256(JSON.stringify(token.data)+ 'somesecret').toString();
// if (resultHash === token.hash) {
//     console.log('data was not changed');
// } else {
//     console.log('data was changed. Do not trust!');
// }

