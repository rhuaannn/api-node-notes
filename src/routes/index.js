const { Router } = require("express");

const usersRoutes = require("./users.routes");
const notesRouter = require("./notes.routes");

const routes = Router();
routes.use("/users", usersRoutes);
routes.use("/notes", notesRouter);

module.exports = routes;
