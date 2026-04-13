const response                    = require("../../utils/response");
const UserRepository              = require("../../repositories/user.repository");
const UserNotificationRepository  = require("../../repositories/userNotification.repository");
const { hashPassword }            = require("../../utils/hash");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await UserRepository.getAllUsers();
      return response.success(res, "All user fetched", users || []);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getAllUsersDatatables(req, res) {
    try {
      const { akses } = res.locals;
      if (akses.view_level?.trim() !== "Y") {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }

      const { draw, start, length, order, columns } = req.query;
      const search = req.query["search[value]"] || req.query.search?.value || "";

      const [result, totalCount] = await Promise.all([
        UserRepository.getPaginatedUsers({
          start:  parseInt(start)  || 0,
          length: parseInt(length) || 10,
          search,
          order,
          columns,
        }),
        UserRepository.countAll(),
      ]);

      const data = result.rows.map((user) => ({
        ...user.get({ plain: true }),
        akses: {
          edit:   akses.edit_level   === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      return res.status(200).json({
        success:         true,
        message:         "User fetched successfully",
        draw:            parseInt(draw) || 0,
        recordsTotal:    totalCount,
        recordsFiltered: result.count,
        data,
      });
    } catch (error) {
      console.error("Error getAllUsersDatatables:", error);
      return response.error(res, error.message);
    }
  }

  async getUserById(req, res) {
    try {
      const user = await UserRepository.getUserById(req.params.id);
      if (!user) return response.notFound(res, "User not found");
      return response.success(res, "User fetched", user);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getUnreadNotifications(req, res) {
    const user = req.session?.user;
    if (!user || (user.id_level !== 1 && user.id_level !== 6)) {
      return res.status(403).json({ status: "error", message: "Notifikasi hanya tersedia untuk admin" });
    }

    try {
      const notifications = await UserNotificationRepository.getUnreadNotifications();
      return response.success(res, "All notification fetched", notifications || []);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getPendingUserNotifications(req, res) {
    const user = req.session?.user;
    if (!user || (user.id_level !== 1 && user.id_level !== 6)) {
      return res.status(403).json({ status: "error", message: "Notifikasi hanya tersedia untuk admin" });
    }

    try {
      const io    = req.app.get("io");
      const users = await UserRepository.getAllUserNotifications();
      const newNotifs = [];

      for (const u of users) {
        const existing = await UserNotificationRepository.findByUserId(u.id);
        if (!existing) {
          const created = await UserNotificationRepository.createNotification({
            userId:  u.id,
            message: `${u.fullname} (${u.username}) mendaftar dan belum di-approve`,
          });
          newNotifs.push({ username: u.username, fullname: u.fullname });
        }
      }

      if (io && newNotifs.length > 0) {
        newNotifs.forEach((notif) => io.to("admin").emit("user_registered", notif));
      }

      const notifications = await UserNotificationRepository.getUnreadNotifications();
      return response.success(res, "Pending user notifications fetched", notifications);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async createUser(req, res) {
    try {
      const requiredFields = ["username", "fullname", "password", "id_level", "is_active", "app"];
      if (!requiredFields.every((field) => req.body[field])) {
        return response.error(res, "Semua field wajib diisi", 400);
      }

      const userData = {
        ...req.body,
        password: await hashPassword(req.body.password),
      };

      const newUser = await UserRepository.createUser(userData);
      return response.created(res, "User created", newUser);
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async updateUser(req, res) {
    try {
      const user = await UserRepository.getUserById(req.params.id);
      if (!user) return response.notFound(res, "User not found");

      await UserRepository.updateUser(req.params.id, req.body);
      return response.success(res, "User updated successfully");
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await UserRepository.getUserById(req.params.id);
      if (!user) return response.notFound(res, "User not found");

      const notification = await UserNotificationRepository.findByUserId(req.params.id);
      if (notification) await UserNotificationRepository.deleteNotification(req.params.id);

      await UserRepository.deleteUser(req.params.id);
      return response.success(res, "User deleted successfully");
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async approveUser(req, res) {
    try {
      const user = await UserRepository.getUserById(req.params.id);
      if (!user) return response.notFound(res, "User not found");

      await UserRepository.updateUser(req.params.id, { is_active: "Y", app: "Y" });
      await UserNotificationRepository.deleteNotification(req.params.id);

      return response.success(res, "User approved successfully");
    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new UserController();