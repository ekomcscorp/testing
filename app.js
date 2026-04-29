require('dotenv').config({
  path: process.env.NODE_ENV === "production" ? '.env' : '.env.local',
  override: true
});

const express = require("express");
const session = require("express-session");
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

app.set("trust proxy", 1);
const isProduction = process.env.NODE_ENV === "production";

// Buat satu instance sessionMiddleware
const sessionMiddleware = session({
  secret: "rahasia_kamu",
  resave: false,
  saveUninitialized: false, // disarankan untuk keamanan & efisiensi
  cookie: { 
    secure: isProduction, 
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax"
  }, // kalau di production, ganti jadi true + pakai https
});

// Pakai di HTTP routes (Express)
app.use(sessionMiddleware);

const socketHandler = require("./utils/socket");
socketHandler(io, sessionMiddleware); // Kirim session ke socket

app.use(injectUser); // ⬅️ Middleware global
app.use(express.static(path.join(__dirname, "public")));

// 🌐 Middleware untuk inject data user ke view
// app.use((req, res, next) => {
//   res.locals.username = req.session.user?.username || null;
//   res.locals.fullname = req.session.user?.fullname || null;
//   next();
// });

// 📄 Parsing Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://mediumspringgreen-meerkat-585223.hostingersite.com",
  "https://gold-lark-507177.hostingersite.com"
];

app.use(cors({
  unction (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy blokir origin ini'), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Agar cookie session bisa dipakai
}));
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

// 🚀 Server run
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// server.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on http://0.0.0.0:3000');
// });
