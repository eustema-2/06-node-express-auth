require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");

// SERVIVES
const { comparePassword, hashPassword } = require("./services/password");

const app = express();

app.use(express.json());

const prisma = new PrismaClient();

// CREATE USER
app.post("/", async (req, res) => {
  try {
    const data = req.body;
    data.password = await hashPassword(data.password);
    const user = await prisma.user.create({
      data,
    });
    res.json(user);
  } catch (error) {
    res.status(400).json("Email già presente a sistema");
  }
});

// GET USER BY ID
app.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(400).json("L'ID non è valido");

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) return res.status(404).json("L'utente non può essere trovato");

  res.json(user);
});

// GET ALL USERS
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// PUT UPDATE USER
app.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json("L'ID non è valido");

    const { password, ...data } = req.body;

    const user = await prisma.user.update({ where: { id }, data });

    res.json(user);
  } catch (error) {
    res.status(500).json("Qualcosa è andato storto");
  }
});

// DELETE USER
app.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json("L'ID non è valido");

    const user = await prisma.user.delete({
      where: { id },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json("Qualcosa è andato storto");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) return res.status(400).json("Errore nelle credenziali");

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) return res.status(400).json("Errore nelle credenziali");

  // TODO: Generare un JWT e restituirlo al client
  res.json("ok");
});

// REQUEST RESET PASSWORD
app.post("/request-reset", (req, res) => {});

app.listen(process.env.SERVER_PORT, () => {
  console.log("Server is running!" + process.env.SERVER_PORT);
});
