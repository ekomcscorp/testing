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

async changePassword(req, res) {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.user?.id;

  console.log("🟡 Change password attempt for user ID:", userId);
  console.log("Session user:", req.session.user);

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
