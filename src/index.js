const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRoutes');
const taskRouter = require('./routers/taskRouter');
const app = express();
const port = process.env.PORT;
app.use(express.json()); //parses the body as json
app.use(userRouter);
app.use(taskRouter);
app.listen(port, () => {
  console.log('Up and running on port', port);
});
