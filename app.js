require('dotenv').config({
  path: process.env.NODE_ENV === "production" ? '.env' : '.env.local',
  override: true
});

const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const http = require("http"); // Tambahan
const { Server } = require("socket.io"); // Tambahan
const { injectUser } = require("./middleware"); // Pastikan middleware ini ada
const multer = require("multer");
const app = express();
const server = http.createServer(app); // Ganti dari app.listen
const io = new Server(server); // Socket.IO instance
const { setIO } = require("./utils/socketIO");
setIO(io); // ✅ ini penting agar getIO() bisa dipakai di auth.service.js

app.set("trust proxy", true);
const isProduction = process.env.NODE_ENV === "production";

// Socket Handler tanpa express-session
const socketHandler = require("./utils/socket");
socketHandler(io); // Kirim io ke socket

const extractJwt = require("./middleware/extractJwt");
app.use(extractJwt); // ⬅️ Middleware untuk mendeteksi JWT dari Cookie/Header

app.use(injectUser); // ⬅️ Middleware global
app.use(express.static(path.join(__dirname, "public")));


// 📄 Parsing Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:8000",
  "https://mediumspringgreen-meerkat-585223.hostingersite.com",
  "https://gold-lark-507177.hostingersite.com"
];

app.use(cors({
  origin: function(origin, callback) {
    
    console.log("Origin:", origin);

    // If no Origin header, treat differently between environments.
    // In production we require an Origin for browser requests (avoid proxy-stripped bypass),
    // in development allow missing Origin for tools like curl.
    if (!origin) {
      if (process.env.NODE_ENV === "production") {
        console.warn("Missing Origin header in production — refusing CORS");
        return callback(null, false);
      }
      return callback(null, true);
    }

    // Properly check membership — `includes` returns boolean
    if (!allowedOrigins.includes(origin)) {
      console.warn(`Blocked CORS origin: ${origin}`);
      // Signal CORS middleware to NOT set CORS headers (don't throw Error -> no 500)
      return callback(null, false);
    }

    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  credentials: true, // Agar cookie session bisa dipakai
}));

// Middleware: Jika request datang dari browser (ada Origin) dan origin tidak diizinkan,
// tolak dengan 403 JSON agar klien mendapatkan respons yang jelas.
app.use((req, res, next) => {
  const origin = req.get('Origin') || req.headers.origin;
  if (!origin) return next(); // non-browser request

  if (!allowedOrigins.includes(origin)) {
    console.warn(`Request blocked by CORS middleware: ${origin} -> ${req.method} ${req.originalUrl}`);
    return res.status(403).json({
      error: 'CORS origin not allowed',
      origin: origin
    });
  }

  return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// 📂 Static dan View
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🔐 Auth routes
const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

// 📦 Auto-load UI Routes (nested-friendly)
const uiRoutesPath = path.join(__dirname, "routes", "ui");


function loadUiRoutes(basePath, parentRoute = "") {
  if (!fs.existsSync(basePath)) return;

  fs.readdirSync(basePath).forEach((file) => {
    const fullPath = path.join(basePath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // masuk folder → jadi endpoint
      loadUiRoutes(fullPath, path.join(parentRoute, file));
    }
    else if (file.endsWith(".routes.js")) {

      const route = require(fullPath);

      const isIndex = file === "index.routes.js";

      // 🔥 ini penting
      const routeName = isIndex ? "" : file.replace(".routes.js", "");

      const routePath = path.join(parentRoute, routeName)
        .replace(/\\/g, "/")
        .replace(/\/$/, "");

      const finalPath = "/" + routePath;

      app.use(finalPath, route);

      console.log(`✅ UI route: ${finalPath || "/"}`);
    }
  });
}

loadUiRoutes(uiRoutesPath);
const loadApiRoutes = (dir, baseRoute = "") => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      loadApiRoutes(fullPath, path.join(baseRoute, file));
    }
    else if (file.endsWith(".routes.js")) {

      const route = require(fullPath);

      const routePath = `/api/${baseRoute}`
        .replace(/\\/g, "/")
        .replace(/\/$/, "");

      app.use(routePath, route);

      console.log(`✅ Loaded API route: ${routePath}`);
    }
  });
};

loadApiRoutes(path.join(__dirname, "routes", "api"));


// 🏠 Root redirect
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.use((err, req, res, next) => {
  if (err.message === 'Blocked by CORS Mentor Policy') {
    return res.status(403).json({
      status: 403,
      message: "Forbidden: Anggota terlarang tidak boleh masuk (CORS Error)."
    });
  }
  next(err);
});

// 🚀 Server run
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
