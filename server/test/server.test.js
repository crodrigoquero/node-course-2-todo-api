const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


beforeEach(populateUsers); // beforeEach (mocha): runs before all tests
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('Should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err); // return keyword stops the function execution
            }

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('Should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe('GET /todos', () => {
    it('shold get all todos', (done) => {
        request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('shold return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
              expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('shold NOT return todo doc CREATED BY OTHER USER', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`) // try to tetch the 2nd user
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
        .end(done);
    });

    it('Should return 404 if todo is not found', (done) => {
        // make sure get a 404 back
        var hexId = new ObjectID().toHexString();

        request(app)
         .get(`/todos/${hexId}`)
         .set('x-auth', users[0].tokens[0].token)
         .expect(404)
         .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        // /todos/123
        request(app)
         .get('/dos/123abc')
         .set('x-auth', users[0].tokens[0].token)
         .expect(404)
         .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // finally, query de database to see if the doc was actually deleted by using findById
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done(); // we need to call this to end the test case
                }).catch((e) => done());
            })
    });

    it('should remove a todo', (done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // finally, query de database to see if the doc was actually deleted by using findById
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist();
                    done(); // we need to call this to end the test case
                }).catch((e) => done());
            })
    });

    it('Should return 404 if todo not found', (done) => {
        // make sure get a 404 back
        var hexId = new ObjectID().toHexString();

        request(app)
         .delete(`/todos/${hexId}`)
         .set('x-auth', users[1].tokens[0].token)
         .expect(404)
         .end(done);
    });

    it('Should return 404 if object id is invalid', (done) => {
        // /todos/123
        request(app)
         .delete('/dos/123abc')
         .set('x-auth', users[1].tokens[0].token)
         .expect(404)
         .end(done);
    });

});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString(); // grab id of the first tem
        var text = 'This should be the new test'; // update text, set compelted to true  
        
        request(app)
          .patch(`/todos/${hexId}`)
          .set('x-auth', users[0].tokens[0].token)
          .send({
              completed: true,
              text
          })
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(text);
              expect(res.body.todo.completed).toBe(true);
              expect(res.body.todo.completedAt).toBeA('number');
          })
          .end(done);
    });

    it('should NOT update the todo CREATED BY OTHER USER', (done) => {
        var hexId = todos[0]._id.toHexString(); // grab id of the first tem
        var text = 'This should be the new test'; // update text, set compelted to true  
        
        request(app)
          .patch(`/todos/${hexId}`)
          .set('x-auth', users[1].tokens[0].token)
          .send({
              completed: true,
              text
          })
          .expect(404)
          .end(done);
    });

    it('should clear compeltedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString(); // grab id of the first tem
        var text = 'This should be the new test'; // update text, set compelted to true  
        
        request(app)
          .patch(`/todos/${hexId}`)
          .set('x-auth', users[1].tokens[0].token)
          .send({
              completed: false,
              text
          })
          .expect(200)
          .expect((res) => {
              expect(res.body.todo.text).toBe(text);
              expect(res.body.todo.completed).toBe(false);
              expect(res.body.todo.completedAt).toNotExist();
          })
          .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
        .get('/users/me') // send a request...
        .set('x-auth', users[0].tokens[0].token) // ...with this data
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
         .post('/users')
         .send({email, password})
         .expect(200)
         .expect((res) => {
             expect(res.headers['x-auth']).toExist();
             expect(res.body._id).toExist();
             expect(res.body.email).toBe(email);
         })
         .end((err) => {
            if(err) {
                return done(err);
            }

            User.findOne({email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            })
         });
    });

    it('should return validation errors if request is invalid', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'and',
                password: '123' 
            })
            .expect(400)
            .end(done);
    });

    it('should not create a user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: users[0].mail,
                password: 'Password123!'
            })
            .expect(400)
            .end(done);
    })
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    })
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password + 1
        })
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(1);
                done();
            }).catch((e) => done(e));
        })     
    });
});

describe('DELETE /users/me/token', () => {
    it('Should remove auth token on logout', (done) => {
        // DELETE  /users/me/token//
        // Set x-aouth equal to token
        // 200
        // Find user, very tokens array has lenght of zero
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});