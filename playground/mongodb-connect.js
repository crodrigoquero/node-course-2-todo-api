//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // ES6 object destructuring. Same result as previous line

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server'); // return keyword stops function execution
    }
    console.log('Connected to MongoDB server');
    
    // db.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert todo', err);
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });
    
    // db.collection('Users').insertOne({ // takes two arguments:
    //     name: 'Carlos', // 1) the documento or collecion to insert...
    //     age: 51,
    //     location: 'Eastleigh'
    // }, (err, result) => { // 2) a callback function to manage sucess/error
    //     if (err) {
    //         return console.log('Unable to insert todo', err); // error
    //     }

    //     console.log(result.ops); // success (in this case, just print the new document / record)
    // });

    db.close(); // finally, close the connection anyway

});