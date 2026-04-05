const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const jsonParser = express.json();
app.use(express.static(__dirname + "/public"));

// ПРАВИЛЬНА URL-рядок з Docker env
const mongoUrl = `mongodb://${process.env.MONGO_DB_HOSTNAME}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB}`;

// Схема користувача
const userSchema = new mongoose.Schema(
  {
    surname: String,
    name: String,
    fathername: String,
    age: Number,
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

// Підключення до MongoDB
async function startServer() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Підключення до MongoDB встановлено");

    app.listen(3000, () => {
      console.log("Сервер запущено на http://localhost:3000");
    });
  } catch (err) {
    console.error("Помилка підключення до MongoDB:", err);
  }
}

startServer();

//        CRUD API
/*
 * GET /api/users — отримати всіх користувачів
 */
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch {
    res.status(500).send({ message: "Помилка при отриманні даних" });
  }
});

/*
 * GET /api/users/:id — отримати одного користувача
 */
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch {
    res.status(400).send({ message: "Некоректний ID користувача" });
  }
});

/*
 * POST /api/users — створити користувача
 */
app.post("/api/users", jsonParser, async (req, res) => {
  try {
    const { surname, name, fathername, age } = req.body;

    if (!surname || !name || !fathername || !age)
      return res.status(400).send({ message: "Неповні дані" });

    const newUser = new User({
      surname,
      name,
      fathername,
      age: parseInt(age),
    });

    const result = await newUser.save();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Помилка під час додавання користувача" });
  }
});

/*
 * PUT /api/users — оновлення користувача
 */
app.put("/api/users", jsonParser, async (req, res) => {
  try {
    const { id, surname, name, fathername, age } = req.body;

    if (!id || !surname || !name || !fathername || !age)
      return res.status(400).send({ message: "Неповні дані" });

    const result = await User.findByIdAndUpdate(
      id,
      {
        surname,
        name,
        fathername,
        age: parseInt(age),
      },
      { new: true }
    );

    res.send(result);
  } catch {
    res.status(500).send({ message: "Помилка при оновленні даних" });
  }
});

/*
 * DELETE /api/users/:id — видалення користувача
 */
app.delete("/api/users/:id", async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch {
    res.status(400).send({ message: "Некоректний ID користувача" });
  }
});

// Закриття з'єднання при CTRL+C
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Підключення до MongoDB закрито");
  process.exit(0);
});
