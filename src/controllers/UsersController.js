const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(req, res) {
    const { name, email, password } = req.body;
    const database = await sqliteConnection();

    const checkUserExists = await database.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (checkUserExists) {
      throw new AppError("Este e-mail já existe!");
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users(name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    return res.status(201).json();
  }

  async update(req, res) {
    const { name, email, password, old_password } = req.body;
    const user_id = req.user.id

    const database = await sqliteConnection();

    const user = await database.get("SELECT * FROM users WHERE id = ?", [user_id]);

    if (!user) {
      throw new AppError("Usuário não encontrado!");
    }

    const userWithUpdateEmail = await database.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Voce precisa informar a senha antiga!");
    }
    if (password && old_password) {
      const checkPassoword = await compare(old_password, user.password);

      if (!checkPassoword) {
        throw new AppError("Senha aniga está errada!");
      }
      user.password = await hash(password, 8);
    }

    await database.run(
      `
      UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME('now')
      WHERE id = ?
    `,
      [user.name, user.email, user.password, user_id]
    );

    return res.status(200).json();
  }

  async getUsers(req, res) {
    const database = await sqliteConnection();

    const { id } = req.params;

    const checkUsers = await database.all("SELECT * FROM users");
    const checkUserId = await database.get(`SELECT * FROM users WHERE id = ?`, [
      id,
    ]);

    if (!checkUsers) {
      throw new AppError("Não existe usuário!");
    }
    if (checkUserId) {
      const usersId = await database.get(`SELECT * FROM users WHERE id = ?`, [
        id,
      ]);
      return res.status(200).json({ usersId });
    }
    if (checkUsers) {
      const users = await database.all("SELECT * FROM users");
      return res.status(200).json({ users });
    }
  }

  async deleteUsers(req, res) {
    const { id } = req.params;
    const database = await sqliteConnection();

    const chekUserDelete = await database.get(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (chekUserDelete) {
      await database.delete(`DELETE FROM users ${id}`);
    }
    if (!chekUserDelete) {
      throw new AppError("Usuário não existe !");
    }
    return res.status(200).json();
  }
}
module.exports = UsersController;
