require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const winston = require("winston");

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
const URL_PROD = process.env.PROD_URL; // Ej: https://mi-proyecto.onrender.com
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.gstatic.com",
          "https://www.googleapis.com"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:5000",  // Para desarrollo
          URL_PROD,                 // Para producción en Render
          "https://*.firebaseio.com",
          "https://*.googleapis.com",
          "https://identitytoolkit.googleapis.com"
        ],
        imgSrc: ["'self'", "data:"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ]
      }
    }
  })
);

/* RATE LIMIT */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

/* =========================
   ESTÁTICOS (Frontend)
========================= */
app.use(express.static(path.join(__dirname, "frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/* =========================
   MONGO
========================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Mongo conectado"))
.catch(err => console.log(err));

/* =========================
   MODELOS
========================= */

/* DONACIONES */
const Donacion = mongoose.model("Donacion", new mongoose.Schema({
  NombreCliente: String,
  MontoDinero: Number,
  Organizacion: String,
  userEmail: String,
  hash: String,
  fecha: { type: Date, default: Date.now }
}));

/* COMPROMISOS */
const Compromiso = mongoose.model("Compromiso", new mongoose.Schema({
  userEmail: String,
  texto: String,
  fecha: { type: Date, default: Date.now }
}));

/* =========================
   RUTA PRINCIPAL
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/* =========================
   DONACIONES
========================= */

/* POST */
app.post("/donacion", async (req, res) => {
  try {
    const { NombreCliente, MontoDinero, Organizacion, userEmail } = req.body;

    const datos = `${NombreCliente}-${MontoDinero}-${Organizacion}-${Date.now()}`;
    const hash = crypto.createHash("sha256").update(datos).digest("hex");

    const nueva = new Donacion({
      NombreCliente,
      MontoDinero,
      Organizacion,
      userEmail,
      hash
    });

    const guardada = await nueva.save();
    res.json(guardada);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error servidor" });
  }
});

/* GET POR USUARIO */
app.get("/donaciones/:email", async (req, res) => {
  try {
    const lista = await Donacion.find({ userEmail: req.params.email });
    res.json(lista);
  } catch {
    res.status(500).json({ error: "Error servidor" });
  }
});

/* DELETE */
app.delete("/donacion/:id", async (req, res) => {
  try {
    await Donacion.findByIdAndDelete(req.params.id);
    res.json({ message: "Eliminado" });
  } catch {
    res.status(500).json({ error: "Error servidor" });
  }
});

/* =========================
   COMPROMISOS
========================= */

/* GET TODOS */
app.get("/compromisos", async (req, res) => {
  try {
    const lista = await Compromiso.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener compromisos" });
  }
});

/* POST */
app.post("/compromisos", async (req, res) => {
  try {
    const { userEmail, texto } = req.body;

    const nuevo = new Compromiso({
      userEmail,
      texto
    });

    const guardado = await nuevo.save();
    res.json(guardado);

  } catch (error) {
    res.status(500).json({ error: "Error al guardar compromiso" });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});