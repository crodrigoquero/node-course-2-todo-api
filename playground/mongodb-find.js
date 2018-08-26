//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb'); // ES6 object destructuring. Same result as previous line

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server'); // return keyword stops function execution
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({ 
    //     _id: new ObjectID('5b82d3c29d2d3db4d2d944b0') 
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    db.collection('Users').find({name: 'Carlos'}).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    });

    //db.close(); // finally, close the connection anyway
});