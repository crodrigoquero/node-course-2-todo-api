const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000; // ir PORT variable is not defined, set port to 3000 ('||' = 'or')

app.use(bodyParser.json());

app.post('/todos', (req, res) => { // entrada de datos desde el cliente
    //console.log(req.body);
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) =>{
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) =>{ // salida de datos hacia el cliente
    Todo.find().then((todos) => {
      res.send({todos});  
    })
}, (e) => {
    res.status(400).send(e);
});

// GET /todos/123456 - How to get an individual record from this API. :ID IS GOING TO CREATE THE ID VARIABLE
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
           return res.status(404).send();
        }
            
        res.send({todo}); // ES object notation, equivalent to "{todo: todo}"
        // we respondo with an object which has a 'todo' property (simplified notation, when the properti name and the value have same name)
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
    // get id
    var id = req.params.id;

    // validate the id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // try to delete the doc (record)
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) { // fail?
            return res.status(404).send(); // then send 
        }

        res.send({todo}); // success!!
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    // The pick utility allows us to select the properties we want from a target object. 
    // We can achieve the same results using destructuring and shorthand object literals?

    // validate the id comming from http request (eq)
    if (!ObjectID.isValid(id)) {
        return res.status(404).send(); // if is not valid id send a 404 http error
    }

    if (_.isBoolean(body.completed) && body.completed) { // from lodahs
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send(); // return keyword stops execution here
        }

        res.send(todo); // success!!! RECORD WAS REALLY UPDATED. send some feedback, please
    }).catch((e) => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};