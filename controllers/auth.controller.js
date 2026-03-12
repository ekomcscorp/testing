const path = require("path");
const authService = require("../services/auth.service");

class AuthController {
showLoginForm(req, res) {
console.log("🔎 Show login page");
res.render("login", { error: null });
}

async login(req, res) {
const { username, password } = req.body;


console.log("🟡 Login attempt");
console.log("Username:", username);
console.log("Password length:", password ? password.length : 0);

try {
  const { user } = await authService.login(username, password);

  console.log("🟢 User found in DB:", user ? user.username : null);
  console.log("User ID:", user?.id);
  console.log("User Level:", user?.id_level);

  req.session.user = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    id_level: user.id_level,
  };

  console.log("✅ Session created:", req.session.user);

  return res.redirect("/dashboard");

} catch (error) {
  console.error("❌ Login error:", error.message);
  return res.render("login", { error: error.message });
}


}

async registerUser(req, res) {
console.log("🟡 Register attempt:", req.body.username);


try {
  const result = await authService.registerUser(req.body);

  console.log("Register result:", result);

  if (result.success) {
    res.render("login", {
      error: "Akun berhasil dibuat. Menunggu persetujuan admin.",
    });
  } else {
    res.render("login", { error: result.message });
  }
} catch (err) {
  console.error("❌ Register error:", err);
  res.render("login", { error: "Terjadi kesalahan saat registrasi." });
}

}

logout(req, res) {
console.log("🔵 User logout:", req.session.user?.username);


req.session.destroy(() => {
  res.redirect("/login");
});


}
}

module.exports = new AuthController();
