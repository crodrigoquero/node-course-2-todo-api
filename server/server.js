var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

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

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};