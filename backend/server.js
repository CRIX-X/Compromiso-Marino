require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const fs = require('fs');

const app = express();

/* =========================
   LOGGER
========================= */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "security.log" })
  ]
});

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   HELMET (seguridad)
========================= */
const URL_PROD = process.env.PROD_URL || "*";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://www.gstatic.com", "https://www.googleapis.com"],
        connectSrc: ["'self'", URL_PROD],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"]
      }
    }
  })
);

/* =========================
   RATE LIMIT
========================= */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

/* =========================
   MONGO
========================= */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI no definido en las Environment Variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch(err => console.error("❌ Error al conectar Mongo:", err));

/* =========================
   MODELOS
========================= */
const Donacion = mongoose.model("Donacion", new mongoose.Schema({
  NombreCliente: String,
  MontoDinero: Number,
  Organizacion: String,
  userEmail: String,
  hash: String,
  fecha: { type: Date, default: Date.now }
}));

const Compromiso = mongoose.model("Compromiso", new mongoose.Schema({
  userEmail: String,
  texto: String,
  fecha: { type: Date, default: Date.now }
}));

/* =========================
   RUTAS DE API
========================= */

/* DONACIONES */
app.post("/donacion", async (req, res) => {
  try {
    const { NombreCliente, MontoDinero, Organizacion, userEmail } = req.body;
    const datos = `${NombreCliente}-${MontoDinero}-${Organizacion}-${Date.now()}`;
    const hash = crypto.createHash("sha256").update(datos).digest("hex");

    const nueva = new Donacion({ NombreCliente, MontoDinero, Organizacion, userEmail, hash });
    const guardada = await nueva.save();
    res.json(guardada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error servidor" });
  }
});

app.get("/donaciones/:email", async (req, res) => {
  try {
    const lista = await Donacion.find({ userEmail: req.params.email });
    res.json(lista);
  } catch {
    res.status(500).json({ error: "Error servidor" });
  }
});

app.delete("/donacion/:id", async (req, res) => {
  try {
    await Donacion.findByIdAndDelete(req.params.id);
    res.json({ message: "Eliminado" });
  } catch {
    res.status(500).json({ error: "Error servidor" });
  }
});

/* COMPROMISOS */
app.get("/compromisos", async (req, res) => {
  try {
    const lista = await Compromiso.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener compromisos" });
  }
});

app.post("/compromisos", async (req, res) => {
  try {
    const { userEmail, texto } = req.body;
    const nuevo = new Compromiso({ userEmail, texto });
    const guardado = await nuevo.save();
    res.json(guardado);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar compromiso" });
  }
});

/* =========================
   ESTÁTICOS (Frontend)
========================= */

// Sirve la carpeta public que está dentro de backend
app.use(express.static(path.join(__dirname, "public")));

// Todas las rutas que no sean API van al index.html (index.html o Index.html)
app.use((req, res, next) => {
  if (req.path.startsWith('/donacion') || req.path.startsWith('/compromisos')) return next();

  const indexLower = path.join(__dirname, "public", "index.html");
  const indexUpper = path.join(__dirname, "public", "Index.html");

  if (fs.existsSync(indexLower)) {
    res.sendFile(indexLower);
  } else if (fs.existsSync(indexUpper)) {
    res.sendFile(indexUpper);
  } else {
    res.status(404).send("index.html no encontrado");
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
