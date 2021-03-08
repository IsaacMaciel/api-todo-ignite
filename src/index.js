const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const existAcount = users.find((user) => user.username === username);

  request.userName = username;

  return existAcount
    ? next()
    : response.status(403).json({ error: "User no exist" });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();
  const todos = [];

  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) return response.status(400).json({error: "User already exist"});

  users.push({
    id,
    name,
    username,
    todos,
  });

  const created = users.find((user) => user.id === id);

  return created
    ? response.status(201).json(created)
    : response.status(500).json({ error: "Houve erro na aplicação" });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const username = request.userName;
  const userTodo = users.find((user) => user.username === username);

  if(userTodo.todos.lengh === 0 ) return response.status(204).json()

  return response.json(userTodo.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const username = request.userName;
  const id = uuidv4();

  const userTodo = users.find((user) => user.username === username);
  const newTask = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  userTodo.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const username = request.userName;

  const task = users
    .find((user) => user.username === username)
    .todos.find((element) => element.id === id);

  if (!task) return response.status(404).json({ error: "Task no exist"});

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(201).json(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.userName;

  const task = users
    .find((user) => user.username === username)
    .todos.find((element) => element.id === id);

  if (task) {
    task.done = true
    return response.json(task);
  }
  return response.status(404).json({error: "Task no exist"})

});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.userName;

  const userTODO = users.find((user) => user.username === username);
  const task = userTODO.todos.some((element) => element.id === id);
  if (!task) return response.status(404).json({error: "To-do no exist"})

  userTODO.todos = userTODO.todos.filter(element => element.id !== id)


  return response.status(204).json();
});

module.exports = app;
