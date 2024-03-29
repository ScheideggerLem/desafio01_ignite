const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found!"});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({error: "User already exists."});
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users);
});

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.query;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createdAt: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  if (!user.todos.find(todo => todo.id === id)) {
    return response.status(404).json({error: "This todo does not exist."})
  }

  user.todos.find(todo_title => todo_title.id === id).title = title;
  user.todos.find(todo_deadline => todo_deadline.id === id).deadline = new Date(deadline);

  return response.status(200).json({success: "This todo has been updated."});
});

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if (!user.todos.find(todo => todo.id === id)) {
    return response.status(404).json({error: "This todo does not exist."})
  }

  user.todos.find(todo => todo.id === id).done = true;

  return response.status(200).json({success: "This todo has been marked as done."});
});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if (!user.todos.find(todo => todo.id === id)) {
    return response.status(404).json({error: "This todo does not exist."})
  }

  user.todos.splice(user.todos.find(todo => todo.id === id), 1);

  return response.status(204).send();
});

module.exports = app;