const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let dob = null;

const initialize = async () => {
  try {
    dob = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at");
    });
  } catch (e) {
    console.log(`${e}`);
    process.exit(1);
  }
};
initialize();
const hasStatus = (status) => {
  return status !== undefined;
};

const hasPriority = (priority) => {
  return priority !== undefined;
};

const hasStatusAndPriority = (status, priority) => {
  return status !== undefined && priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasStatusAndPriority(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriority(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatus(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await dob.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};
    `;
  const todo = await dob.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodo = `
    INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');
    `;
  const postDo = await dob.run(postTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let up = "";
  const req = request.body;
  switch (true) {
    case req.status !== undefined:
      up = "Status";
      break;
    case req.priority !== undefined:
      up = "Priority";
      break;
    case req.todo !== undefined:
      up = "Todo";
      break;
  }
  const putTodo = `
     SELECT * FROM todo WHERE id=${todoId}`;
  const putTo = await dob.get(putTodo);
  const {
    todo = putTo.todo,
    priority = putTo.priority,
    status = putTo.status,
  } = request.body;
  const update = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}' WHERE id=${todoId}`;
  await dob.run(update);
  response.send(`${up} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};
    `;
  await dob.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
