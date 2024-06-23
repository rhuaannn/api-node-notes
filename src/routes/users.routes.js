const { Router } = require("express");

const UsersController = require("../controllers/UsersController");

const usersRoutes = Router();

const usersController = new UsersController();

usersRoutes.post("/", usersController.create);
usersRoutes.put("/:id", usersController.update);
usersRoutes.get("/", usersController.getUsers);
usersRoutes.get("/:id", usersController.getUsers);
usersRoutes.delete("/:id", usersController.deleteUsers);
module.exports = usersRoutes;
