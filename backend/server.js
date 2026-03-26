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
// CORS: permite tu frontend de Render y localhost
app.use(cors({
  origin: [
    "https://compromiso-marino.onrender.com",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
}));

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
   RATE LIMIT (puedes aumentar intentos)
========================= */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000
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
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

/* =========================
   SERVIR CUALQUIER HTML (case-insensitive)
========================= */
app.use((req, res, next) => {
  if (req.path.startsWith('/donacion') || req.path.startsWith('/compromisos')) return next();

  const requested = req.path.slice(1); // quita el slash inicial
  let files = fs.readdirSync(publicPath).filter(f => f.endsWith(".html"));

  // Buscar coincidencia ignorando mayúsculas
  let match = files.find(f => f.toLowerCase() === (requested || "index.html").toLowerCase());

  if (match) return res.sendFile(path.join(publicPath, match));

  // fallback a index.html / Index.html
  match = files.find(f => f.toLowerCase() === "index.html");
  if (match) return res.sendFile(path.join(publicPath, match));

  res.status(404).send("Página no encontrada");
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
