const userRepository = require("../repositories/user.repository");
const { getIO } = require("../utils/socketIO");
const { comparePassword } = require("../utils/hash");
const bcrypt = require("bcrypt");
const { sequelize } = require("../models"); // pastikan path relatifnya benar


async function login(identifier, password) {
  const user = await userRepository.getUserByUsername(identifier);
  if (!user) throw new Error("User tidak ditemukan atau Coba login dengan email.");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Password salah");

  if (user.is_active !== 'Y') {
    throw new Error("Akun belum aktif. Menunggu persetujuan admin.");
  }
  // if (user.id_level !== 1 && user.id_level !== 2) {
  //   throw new Error ("Anda tidak memiliki akses untuk login")
  // }

  // Jika kamu ingin filter hanya user web, bisa cek 'app' juga:
  // if (user.app !== 'Y') {
  //   throw new Error("Akun belum disetujui untuk akses aplikasi.");
  // }

  return { message: "Login berhasil", user };
}


async function updatePassword(userId, oldPassword, newPassword) {
  const user = await userRepository.getUserById(userId);
  if (!user) throw new Error("User tidak ditemukan");

  // Validasi password lama
  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) throw new Error("Password lama tidak sesuai");

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password di database
  await userRepository.updateUser(userId, { password: hashedPassword });

  return { message: "Password berhasil diubah" };
}


module.exports = { login,updatePassword };