const response                    = require("../../utils/response");
const UserRepository              = require("../../repositories/user.repository");
const { hashPassword }            = require("../../utils/hash");
const { isValidEmail, getEmailErrorMessage } = require("../../utils/validation");

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
    const akses = res.locals.akses || {};
    
    // Pastikan hak akses view diizinkan
    if (akses.view_level?.trim() !== "Y") {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    const { draw, start, length, order, columns } = req.query;
    const search = req.query["search[value]"] || req.query.search?.value || "";
    const id_level = req.query.id_level ? parseInt(req.query.id_level) : null;

    const [result, totalCount] = await Promise.all([
      UserRepository.getPaginatedUsers({
        start:  parseInt(start)  || 0,
        length: parseInt(length) || 10,
        search,
        order,
        columns,
        filters: id_level ? { id_level } : undefined,
      }),
      UserRepository.countAll(id_level ? { id_level } : undefined),
    ]);

    // Kembalikan objek 'akses' sebagai STRING 'Y' / 'N' agar cocok dengan JS DataTables
    const data = result.rows.map((user) => ({
      ...user.get({ plain: true }),
      akses: {
        edit:   akses.edit_level?.trim()   === "Y",
        delete: akses.delete_level?.trim() === "Y",
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
    return res.status(500).json({ success: false, message: error.message });
  }
}

async getAllTravelsDatatables(req, res) {
  try {
    const akses = res.locals.akses || {};

    if (akses.view_level?.trim() !== "Y") {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    const { draw, start, length, order, columns } = req.query;
    const search = req.query["search[value]"] || req.query.search?.value || "";

    // Hardcode filter id_level = 4 khusus untuk Travel
    const [result, totalCount] = await Promise.all([
      UserRepository.getPaginatedUsers({
        start:  parseInt(start)  || 0,
        length: parseInt(length) || 10,
        search,
        order,
        columns,
        filters: { id_level: 4 },
      }),
      UserRepository.countAll({ id_level: 4 }),
    ]);

    const data = result.rows.map((user) => ({
      ...user.get({ plain: true }),
      akses: {
        edit:   akses.edit_level?.trim()   === "Y",
        delete: akses.delete_level?.trim() === "Y",
      },
    }));

    return res.status(200).json({
      success:         true,
      message:         "Travel fetched successfully",
      draw:            parseInt(draw) || 0,
      recordsTotal:    totalCount,
      recordsFiltered: result.count,
      data,
    });
  } catch (error) {
    console.error("Error getAllTravelsDatatables:", error);
    return res.status(500).json({ success: false, message: error.message });
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




  async createUser(req, res) {
    try {
      const payload = {
        ...req.body,
        username: String(req.body.username || "").trim(),
        fullname: String(req.body.fullname || "").trim(),
        email: String(req.body.email || "").trim(),
        no_wa: String(req.body.no_wa || "").trim(),
        is_active: (req.body.is_active || "Y").toString().trim().toUpperCase(),
      };

      const requiredFields = ["username", "fullname", "password", "email", "no_wa", "id_level", "is_active"];
      if (!requiredFields.every((field) => payload[field])) {
        return response.error(res, "Semua field wajib diisi", 400);
      }

      if (!isValidEmail(payload.email)) {
        return response.error(res, getEmailErrorMessage(payload.email), 400);
      }

      const userData = {
        ...payload,
        password: await hashPassword(payload.password),
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

      // Validate email format jika email diubah
      if (req.body.email && !isValidEmail(req.body.email)) {
        return response.error(res, getEmailErrorMessage(req.body.email), 400);
      }

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


      await UserRepository.deleteUser(req.params.id);
      return response.success(res, "User deleted successfully");
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  // async approveUser(req, res) {
  //   try {
  //     const user = await UserRepository.getUserById(req.params.id);
  //     if (!user) return response.notFound(res, "User not found");

  //     await UserRepository.updateUser(req.params.id, { is_active: "Y", app: "Y" });
  //     await UserNotificationRepository.deleteNotification(req.params.id);

  //     return response.success(res, "User approved successfully");
  //   } catch (error) {
  //     return response.error(res, error.message);
  //   }
  // }
}

module.exports = new UserController();