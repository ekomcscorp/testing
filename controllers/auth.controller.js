const path = require("path");
const authService = require("../services/auth.service");
const jwt = require("jsonwebtoken");
const { success } = require("../utils/response");
const { generateToken } = require("../utils/jwt");


class AuthController {
showLoginForm(req, res) {
console.log("🔎 Show login page");
res.render("login", { error: null });
}

async login(req, res) {
  
const identifier = req.body.username || req.body.email;
const password = req.body.password;


console.log("🟡 Login attempt");
console.log("Identifier:", identifier);
console.log("Password length:", password ? password.length : 0);

  try {
    const { user } = await authService.login(identifier, password);

    console.log("🟢 User found in DB:", user ? user.username : null);

    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      id_level: user.id_level,
    });

    return res.json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error("❌ Login error:", error.message);
    return res.status(400).json({
        success: false,
        message: error.message
    });
  }
}

async apiLogin(req, res) {
  const username = req.body.username || req.body.email;
  const password = req.body.password;

  console.log("🟡 API Login attempt:", req.body);

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Ada data yang belum diisi"
    });
  }

  try {
    const { user } = await authService.login(username, password);

    const token = generateToken({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      id_level: user.id_level,
    });

    return res.json({
      success: true,
      message: "Login berhasil",
      token,
      user
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

  getMe(req, res) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    
    return res.status(200).json({
      success: true,
      message: "Data user berhasil diambil",
      user: req.user
    });
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
  // Hanya API response kalau mau dipanggil pakai fetch
  return res.json({ success: true, message: "Logout berhasil" });
}

async changePassword(req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id; // Ambil dari req.user setelah dimiddleware ensureAuthToken

  console.log("🟡 Change password attempt for user ID:", userId);

  // Validasi user ID
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi"
    });
  }

  // Validasi input
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Semua field harus diisi"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password baru dan konfirmasi tidak sesuai"
    });
  }

  try {
    const result = await authService.updatePassword(userId, oldPassword, newPassword);
    console.log("✅ Password changed successfully for user ID:", userId);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("❌ Change password error:", error);
    console.error("Error message:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Gagal mengubah password"
    });
  }
 }
}

module.exports = new AuthController();
