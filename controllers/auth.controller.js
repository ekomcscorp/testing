const path = require("path");
const authService = require("../services/auth.service");

class AuthController {
  showLoginForm(req, res) {
    res.render("login", { error: null });
  }

  async login(req, res) {
    const { username, password } = req.body;

    try {
      const { user } = await authService.login(username, password);

      req.session.user = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        id_level: user.id_level,
      };

      return res.redirect("/dashboard");

    } catch (error) {
      console.error(error.message);
      return res.render("login", { error: error.message });
    }
  }

  async registerUser(req, res) {
    try {
      const result = await authService.registerUser(req.body);
      if (result.success) {
        res.render("login", {
          error: "Akun berhasil dibuat. Menunggu persetujuan admin.",
        });
      } else {
        res.render("login", { error: result.message });
      }
    } catch (err) {
      console.error(err);
      res.render("login", { error: "Terjadi kesalahan saat registrasi." });
    }
  }

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
}

module.exports = new AuthController();
