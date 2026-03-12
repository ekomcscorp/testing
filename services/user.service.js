const UserRepository = require("../repositories/user.repository");
const UserNotificationRepository = require("../repositories/userNotification.repository");
const { hashPassword } = require("../utils/hash");
const { User } = require("../models");
const { Op } = require("sequelize");
const userNotificationRepository = require("../repositories/userNotification.repository");

class UserService {
  async getAllUsers() {
    try {
      const users = await UserRepository.getAllUsers();
      return users || []; // Jika null/undefined, tetap kembalikan array kosong
    } catch (error) {
      throw new Error(error.message); // Melempar error ke controller
    }
  }

  async getAllUsersDatatables({ draw, start, length, search, order, columns }) {
    const searchValue = search?.value || "";

    const { count, rows } = await UserRepository.getPaginatedUsers({
      start: parseInt(start, 10) || 0,
      length: parseInt(length, 10) || 10,
      search: searchValue,
      order,
      columns
    });

    return {
      draw: parseInt(draw, 10),
      recordsTotal: count,
      recordsFiltered: count,
      data: rows
    };
  }

  async getUserById(id) {
    try {
      const user = await UserRepository.getUserById(id);
      return user || []; // Jika null/undefined, tetap kembalikan array kosong
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUnreadNotifications() {
    try {
      const notifications = await UserNotificationRepository.getUnreadNotifications();
      return notifications || [];
    } catch (error) {
      throw new Error(error.message);
    }
  }


async getPendingUserNotifications(io) {
  const users = await UserRepository.getAllUserNotifications();
  const newNotifs = [];

  for (const user of users) {
    const existing = await UserNotificationRepository.findByUserId(user.id);

    if (!existing) {
      const created = await UserNotificationRepository.createNotification({
        userId: user.id,
        message: `${user.fullname} (${user.username}) mendaftar dan belum di-approve`
      });

      console.log("📥 Notifikasi ditambahkan:", created.dataValues);
      newNotifs.push({
        username: user.username,
        fullname: user.fullname
      });
    } else {
      console.log("⚠️ Sudah ada notifikasi untuk user:", user.username);
    }
  }

  // Emit hanya jika ada notifikasi baru
  if (io && newNotifs.length > 0) {
    newNotifs.forEach((notif) => {
      io.to('admin').emit('user_registered', notif);
    });
  }

  return await UserNotificationRepository.getUnreadNotifications();
}


  async createUser(userData) {
    try {
      const requiredFields = ["username", "fullname", "password", "id_level", "is_active", "app"];

      if (!requiredFields.every(field => userData[field])) {
        throw new Error("Semua field wajib diisi"); // Validasi input
      }
      // 🔒 Hash password sebelum disimpan
      userData.password = await hashPassword(userData.password);

      return await UserRepository.createUser(userData);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateUser(id, userData) {
    try {
      const user = await UserRepository.getUserById(id);
      if (!user) {
        throw new Error("User not found");
      }
      // userData.password = await hashPassword(userData.password);
      await UserRepository.updateUser(id, userData);
      return { message: "User updated successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteUser(id) {
    try {
      const user = await UserRepository.getUserById(id);
      if (!user) {
        throw new Error("User not found");
      }
      // HAPUS NOTIFIKASI
      const notification = await userNotificationRepository.findByUserId(id);

      if (notification) {
        await UserNotificationRepository.deleteNotification(id);
      }

      //  HAPUS USER
      await UserRepository.deleteUser(id);
      return { message: "User deleted successfully" };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async approveUser(id) {
  try {
    const user = await UserRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    await UserRepository.updateUser(id, {
      is_active: 'Y',
      app: 'Y',
    });

    // Hapus notifikasi pendaftaran user
    await UserNotificationRepository.deleteNotification(id);

    return { message: "User approved successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
}


}

module.exports = new UserService();
