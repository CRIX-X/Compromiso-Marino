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
const validator = require("validator");

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   CORS
========================= */
const FRONTEND_URL = process.env.FRONTEND_URL || "*";
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

/* =========================
   HELMET (seguridad)
========================= */
const URL_PROD = process.env.PROD_URL || "*";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // ✅ FIX DEL CARRUSEL (INLINE SCRIPTS PERMITIDOS)
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://www.gstatic.com",
          "https://www.googleapis.com"
        ],

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
   DONACIONES
========================= */

app.post("/donacion", async (req, res) => {
  try {
let { NombreCliente, MontoDinero, Organizacion, userEmail } = req.body;

NombreCliente = validator.escape(NombreCliente.trim());
Organizacion = validator.escape(Organizacion.trim());
userEmail = validator.normalizeEmail(userEmail);
    const datos = `${NombreCliente}-${MontoDinero}-${Organizacion}-${Date.now()}`;

    const hash = crypto
      .createHash("sha256")
      .update(datos)
      .digest("hex");

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

    console.error(error);
    res.status(500).json({ error: "Error servidor" });

  }
});

app.get("/donaciones/:email", async (req, res) => {
  try {

    const lista = await Donacion.find({
      userEmail: req.params.email
    });

    res.json(lista);

  } catch {

    res.status(500).json({
      error: "Error servidor"
    });

  }
});

app.delete("/donacion/:id", async (req, res) => {
  try {

    await Donacion.findByIdAndDelete(req.params.id);

    res.json({
      message: "Eliminado"
    });

  } catch {

    res.status(500).json({
      error: "Error servidor"
    });

  }
});

/* =========================
   COMPROMISOS
========================= */

app.get("/compromisos", async (req, res) => {
  try {

    const lista = await Compromiso.find()
      .sort({ fecha: -1 });

    res.json(lista);

  } catch (error) {

    res.status(500).json({
      error: "Error al obtener compromisos"
    });

  }
});

app.post("/compromisos", async (req, res) => {
  try {

  let { userEmail, texto } = req.body;

texto = validator.escape(texto.trim());
userEmail = validator.normalizeEmail(userEmail);

const nuevo = new Compromiso({
  userEmail,
  texto
});

    const guardado = await nuevo.save();

    res.json(guardado);

  } catch (error) {

    res.status(500).json({
      error: "Error al guardar compromiso"
    });

  }
});

app.put("/compromisos/:id", async (req, res) => {
  try {

    const { texto } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({
        error: "El compromiso no puede estar vacío"
      });
    }

    const actualizado =
      await Compromiso.findByIdAndUpdate(
        req.params.id,
        { texto: validator.escape(texto.trim()) },
        { new: true }
      );

    if (!actualizado) {
      return res.status(404).json({
        error: "Compromiso no encontrado"
      });
    }

    res.json(actualizado);

  } catch (error) {

    res.status(500).json({
      error: "Error al editar compromiso"
    });

  }
});

app.delete("/compromisos/:id", async (req, res) => {
  try {

    const eliminado =
      await Compromiso.findByIdAndDelete(
        req.params.id
      );

    if (!eliminado) {
      return res.status(404).json({
        error: "Compromiso no encontrado"
      });
    }

    res.json({
      message: "Compromiso eliminado"
    });

  } catch (error) {

    res.status(500).json({
      error: "Error al eliminar compromiso"
    });

  }
});

/* =========================
   ESTÁTICOS (Frontend)
========================= */
const publicPath = path.join(__dirname, "public");
console.log("PUBLIC PATH:", publicPath);
console.log("ARCHIVOS PUBLIC:", fs.readdirSync(publicPath));
app.use(express.static(publicPath));

/* =========================
   SERVIR HTML (case-insensitive)
========================= */
app.use((req, res, next) => {
  if (req.path.startsWith('/donacion') || req.path.startsWith('/compromisos')) return next();

  const requested = req.path.slice(1);
  const files = fs.readdirSync(publicPath).filter(f => f.endsWith(".html"));

  let match = files.find(f =>
    f.toLowerCase() === (requested || "index.html").toLowerCase()
  );

  if (match) return res.sendFile(path.join(publicPath, match));

  match = files.find(f => f.toLowerCase() === "index.html");
  if (match) return res.sendFile(path.join(publicPath, match));

  res.status(404).send("Página no encontrada");
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));