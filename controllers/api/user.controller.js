const response = require("../../utils/response");
const userService = require("../../services/user.service");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      return response.success(res, "All user fetched", users)
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getAllUsersDatatables(req, res) {
    try {
      const { akses } = res.locals;

      if (akses.view_level !== 'Y') {
        return res.status(403).json({ error: "Akses ditolak" });
      }

      const result = await userService.getAllUsersDatatables(req.query);

      result.data = result.data.map(row => ({
        ...row.get({ plain: true }),
        akses: {
          edit: akses.edit_level === 'Y',
          delete: akses.delete_level === 'Y'
        }
      }));

      return response.datatables(res, result);
    } catch (error) {
      console.error("Error getAllUsersDatatables:", error);
      return response.error(res, error.message);
    }
  }

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return response.success(res, "User fetched", user);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async getUnreadNotifications(req, res) {
    const user = req.session?.user;

    if (!user || user.id_level !== 1 && user.id_level !== 6) {
    return res.status(403).json({
      status: 'error',
      message: 'Notifikasi hanya tersedia untuk admin'
    });
  }

    try {
      const Notifications = await userService.getUnreadNotifications();
      return response.success(res, "All notification fetched", Notifications)
    } catch (error) {
      return response.error(res, error.message);
    }
  }
  
async getPendingUserNotifications(req, res) {
  const user = req.session?.user;

  if (!user || user.id_level !== 1 && user.id_level !== 6) {
    return res.status(403).json({
      status: 'error',
      message: 'Notifikasi hanya tersedia untuk admin'
    });
  }

  try {
    const io = req.app.get("io");
    const notifications = await userService.getPendingUserNotifications(io);
    return response.success(res, "Pending user notifications fetched", notifications);
  } catch (error) {
    return response.error(res, error.message);
  }
}



  async createUser(req, res) {
    try {
      const newUser = await userService.createUser(req.body);
      return response.success(res, "User created", newUser);
    } catch (error) {
      return response.success(res, error.message, 400);
    }
  }

  async updateUser(req, res) {
    try {
      await userService.updateUser(req.params.id, req.body);
      return response.success(res, "User updated successfully");
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      return response.success(res, "User deleted successfully");
    } catch (error) {
      // res.status(404).json({ message: error.message });
      return response.notFound(res, error.message);
    }
  }

  async approveUser(req, res) {
  try {
    await userService.approveUser(req.params.id);
    return response.success(res, "User approved successfully");
  } catch (error) {
    return response.error(res, error.message);
  }
}
}

module.exports = new UserController();
