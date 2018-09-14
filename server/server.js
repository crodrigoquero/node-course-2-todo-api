require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000; // ir PORT variable is not defined, set port to 3000 ('||' = 'or')

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => { // entrada de datos desde el cliente
    //console.log(req.body);
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) =>{
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) =>{ // salida de datos hacia el cliente
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
      res.send({todos});  
    })
}, (e) => {
    res.status(400).send(e);
});

// GET /todos/123456 - How to get an individual record from this API. :ID IS GOING TO CREATE THE ID VARIABLE
app.get('/todos/:id',authenticate, (req, res) => {
    var id = req.params.id;
    
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
           return res.status(404).send();
        }
            
        res.send({todo}); // ES object notation, equivalent to "{todo: todo}"
        // we respondo with an object which has a 'todo' property (simplified notation, when the properti name and the value have same name)
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    // get id
    var id = req.params.id;

    // validate the id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // try to delete the doc (record)
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) { // fail?
            return res.status(404).send(); // then send 
        }

        res.send({todo}); // success!!
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send(); // return keyword stops execution here
        }

        res.send({todo}); // success!!! RECORD WAS REALLY UPDATED. send some feedback, please
        // CUIDADO! noes lo mismo 'res.send(todo)' que res.send({todo}) (con corchetes) 
    }).catch((e) => {
        res.status(400).send();
    })
});

// POST /users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email','password']);
    var user = new User(req.body);
    //console.log(body);


    user.save().then(() => {
        return user.generateAuthToken();
        //res.send(user); // this line of code just send/saves de user without authentication token
    }).then((token) => {
        res.header('x-auth', token).send(user); // when you prefix a header with x- you create a custom header, just for you
    }).catch((e) => {
        res.status(400).send(e);
    });
});


app.get('/users/me', authenticate ,(req, res) => {
    res.send(req.user);  
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email','password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
})

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};