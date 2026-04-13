const userlevelRepo = require("../../repositories/userlevel.repository");
const aksesRepo     = require("../../repositories/akses.repository");
const menuRepo      = require("../../repositories/menu.repository");
const response      = require("../../utils/response");

class UserlevelController {
  async getAllUserlevel(req, res) {
    try {
      const userlevel = await userlevelRepo.getAllUserlevels();
      return response.success(res, "All userlevel fetched", userlevel || []);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getAllUserlevelDatatables(req, res) {
    try {
      const { akses } = res.locals;
      if (akses.view_level?.trim() !== "Y") {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }

      const { draw, start, length, order, columns } = req.query;
      const search = req.query["search[value]"] || req.query.search?.value || "";

      const [result, totalCount] = await Promise.all([
        userlevelRepo.getPaginatedUserlevels({
          start:  parseInt(start)  || 0,
          length: parseInt(length) || 10,
          search,
          order,
          columns,
        }),
        userlevelRepo.countAll(),
      ]);

      const data = result.rows.map((row) => ({
        ...row.get({ plain: true }),
        akses: {
          edit:   akses.edit_level   === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      return response.datatables(res, {
        draw:            parseInt(draw) || 0,
        recordsTotal:    totalCount,
        recordsFiltered: result.count,
        data,
      });
    } catch (error) {
      console.error("Error getAllUserlevelDatatables:", error);
      return response.error(res, error.message);
    }
  }

  async getUserlevelByLevel(req, res) {
    try {
      const { id_level } = req.params;

      const [menus, akses] = await Promise.all([
        menuRepo.findAll(),
        aksesRepo.getAksesByLevel(id_level),
      ]);

      return response.success(res, "User akses fetched", { akses, menus });
    } catch (error) {
      console.error("Error getUserlevelByLevel:", error);
      return response.error(res, error.message);
    }
  }

  async getUserlevelById(req, res) {
    try {
      const { id } = req.params;
      const userlevel = await userlevelRepo.getUserlevelById(id);
      if (!userlevel) return response.notFound(res, "Userlevel not found");
      return response.success(res, "Userlevel fetched", userlevel);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async createUserlevel(req, res) {
    try {
      if (!req.body.nama_level) {
        return response.error(res, "Semua field wajib diisi", 400);
      }
      const userlevel = await userlevelRepo.createUserlevel(req.body);
      return response.created(res, "Userlevel created", userlevel);
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async updateUserlevel(req, res) {
    try {
      const { id } = req.params;
      const existing = await userlevelRepo.getUserlevelById(id);
      if (!existing) return response.notFound(res, "Userlevel not found");

      await userlevelRepo.updateUserlevel(id, req.body);
      return response.success(res, "Userlevel updated successfully");
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async deleteUserlevel(req, res) {
    try {
      const { id } = req.params;
      const existing = await userlevelRepo.getUserlevelById(id);
      if (!existing) return response.notFound(res, "Userlevel not found");

      await userlevelRepo.deleteUserlevel(id);
      return response.success(res, "Userlevel deleted successfully");
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async upsertAccess(req, res) {
    try {
      const { id_level, akses } = req.body;

      if (!id_level) {
        return response.error(res, "ID Level tidak terdeteksi", 400);
      }
      if (!Array.isArray(akses)) {
        return response.error(res, "Format akses tidak valid", 400);
      }

      const result = await userlevelRepo.upsertAccess(id_level, akses);
      return response.success(res, "Access updated successfully", result);
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }
}

module.exports = new UserlevelController();