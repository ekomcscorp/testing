const menuRepo   = require("../../repositories/menu.repository");
const aksesRepo  = require("../../repositories/akses.repository");
const response   = require("../../utils/response");
const { mapMenuWithAcces } = require("../../utils/menuAcces");

class MenuController {

  // ─── helper internal ────────────────────────────────────────────
  async _getDatatables(req, res, filter = {}) {
    try {
      const { akses } = res.locals;
      
      if (!akses || akses.view_level !== "Y") {
        console.warn("[Menu] Access denied:", { akses, path: req.path });
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }

      const { draw, start, length, order, columns } = req.query;
      const search = req.query["search[value]"] || req.query.search?.value || "";

      console.log("[Menu] getDatatables query:", {
        draw, start, length, search,
        orderLength: order?.length,
        columnsLength: columns?.length,
        filter
      });

      const result = await menuRepo.getPaginated({
        start:  parseInt(start)  || 0,
        length: parseInt(length) || 10,
        search,
        order,
        columns,
        filter,
      });

      console.log("[Menu] Repository result:", {
        count: result.count,
        rowsLength: result.rows?.length || 0
      });

      // Validasi result
      if (!result || typeof result.count !== 'number' || !Array.isArray(result.rows)) {
        throw new Error("Invalid repository response format");
      }

      const data = result.rows.map((row) => ({
        ...(row.get ? row.get({ plain: true }) : row),
        akses: {
          edit:   akses.edit_level   === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      const responseData = {
        draw:            parseInt(draw) || 0,
        recordsTotal:    result.count,
        recordsFiltered: result.count,
        data,
      };

      console.log("[Menu] Response:", {
        recordsTotal: responseData.recordsTotal,
        dataLength: responseData.data.length
      });

      return response.datatables(res, responseData);
    } catch (err) {
      console.error("[Menu] _getDatatables ERROR:", err.message, err.stack);
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
      });
    }
  }

  // ─── endpoints ──────────────────────────────────────────────────
  async getAll(req, res) {
    try {
      const data = await menuRepo.findAll();
      return res.status(200).json({ success: true, message: "Menus fetched successfully", data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getSubmenu(req, res) {
    try {
      const data = await menuRepo.findSubmenu();
      return res.status(200).json({ success: true, message: "Submenus fetched successfully", data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const menu = await menuRepo.findById(req.params.id_menu);
      if (!menu) {
        return res.status(404).json({ success: false, message: "Menu tidak ditemukan" });
      }
      return res.status(200).json({ success: true, message: "Menu fetched successfully", data: menu });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getNested(req, res) {
    try {
      const data = await menuRepo.findNested();
      return res.status(200).json({ success: true, message: "Nested menu fetched successfully", data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // parent menu dengan info akses per level
  async getParentByLevel(req, res) {
    try {
      const { akses } = res.locals;
      if (akses.view_level?.trim() !== "Y") {
        return res.status(403).json({ success: false, message: "Akses ditolak" });
      }

      const menus = await menuRepo.findParents();
      const data  = menus.map((menu) => ({
        ...mapMenuWithAcces(menu),
        akses: {
          edit:   akses.edit_level   === "Y",
          delete: akses.delete_level === "Y",
        },
      }));

      return res.json({ success: true, message: "Parent menus fetched successfully", data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // datatables khusus parent menu saja
  async getDatatablesParent(req, res) {
    try {
      return await this._getDatatables(req, res, { parent_id: null });
    } catch (err) {
      return response.error(res, err.message);
    }
  }

  // datatables untuk semua menu (parent + submenu)
  async getDatatables(req, res) {
    try {
      return await this._getDatatables(req, res);
    } catch (err) {
      return response.error(res, err.message);
    }
  }

  // datatables khusus submenu saja
  async getDatatablesSubmenu(req, res) {
    try {
      return await this._getDatatables(req, res, { parent_not_null: true });
    } catch (err) {
      return response.error(res, err.message);
    }
  }

  async create(req, res) {
    try {
      const requiredFields = ["nama_menu", "link", "icon", "urutan", "is_active"];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ success: false, message: `Field ${field} wajib diisi` });
        }
      }

      const data = await menuRepo.create({
        ...req.body,
        parent_id: req.body.parent_id ?? null,
      });

      return res.status(201).json({ success: true, message: "Menu created successfully", data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async createNested(req, res) {
    try {
      // rekursif helper
      const buildNested = async (menuData, parentId = null) => {
        const created = await menuRepo.create({
          nama_menu: menuData.nama_menu,
          link:      menuData.link,
          icon:      menuData.icon,
          urutan:    menuData.urutan,
          is_active: menuData.is_active,
          parent_id: parentId,
        });
        if (menuData.children?.length > 0) {
          for (const child of menuData.children) {
            await buildNested(child, created.id_menu);
          }
        }
        return created;
      };

      const data = await buildNested(req.body);
      return res.status(201).json({ success: true, message: "Nested menu created successfully", data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id_menu } = req.params;
      const existing = await menuRepo.findById(id_menu);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Menu tidak ditemukan" });
      }

      const data = await menuRepo.update(id_menu, {
        ...req.body,
        parent_id: req.body.parent_id ?? null,
      });

      return res.status(200).json({ success: true, message: "Menu updated successfully", data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id_menu } = req.params;
      const existing = await menuRepo.findById(id_menu);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Menu tidak ditemukan" });
      }

      await menuRepo.destroy(id_menu);
      return res.status(200).json({ success: true, message: "Menu deleted successfully" });
    } catch (err) {
      return response.notFound(res, err.message);
    }
  }
}

module.exports = new MenuController();