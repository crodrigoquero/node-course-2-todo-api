const {ObjectId} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');


// Todo.remove({}).then((result) => {
//     console.log(result);
// });

Todo.findByIdAndRemove('5b89101f25ddba4cf2744526').then((todo)=> {
    console.log(todo);
});