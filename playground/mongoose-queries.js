const {ObjectId} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// var id = '5b85bf6a76d278fa0a28a827';

// if (!ObjectId.isValid(id)) {
//     console.log('Id not valid');
// };

// Todo.find({ // this one return an array
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({ // this one returns an object (this approach is better when you need just one record)
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found'); // return keyword prevenets further execution
//     }
//     console.log('Todo by Id', todo);
// }).catch((e) => console.log(e));

User.findById('5b83f30f58c7fdbfd2ac00e1').then((user) => {
    if (!user) {
        return console.log('Unable to find the user');
    }

    console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
    console.log(e);
})