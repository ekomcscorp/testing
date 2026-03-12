// const aksesmenuService = require("../../services/aksesmenu.service");
// const aksessubmenuService = require("../../services/aksessubmenu.service");
const userlevelService = require("../../services/userlevel.service");
const response = require("../../utils/response");
const aksesService = require("../../services/akses.service");
const menuService = require("../../services/menu.service")

class UserlevelController {
  async getAllUserlevel(req, res) {
    try {
      const userlevel = await userlevelService.getAllUserlevel();
      
      return response.success(res, "All userlevel fetched", userlevel);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getAllUserlevelDatatables(req, res) {
    try {
      console.log("debug akses:", res.locals.akses);
      console.log("debug user:", req.session.user);
      const { akses } = res.locals;

      
      if (akses.view_level !== 'Y') {
        return res.status(403).json({ error: "Akses ditolak" });
      }
  
      const result = await userlevelService.getAllUserlevelDatatables(req.query);
  
      result.data = result.data.map(row => ({
        ...row.get({ plain: true }),
        akses: {
          edit: akses.edit_level === 'Y',
          delete: akses.delete_level === 'Y'
        }
      }));
  
      return response.datatables(res, result);
    } catch (error) {
      console.error("Error getAllUserlevelDatatables:", error);
      return response.error(res, error.message);
    }
  }
  
  async getUserlevelByLevel(req, res) {
      try {
        const {id_level} = req.params;

        const menus = await menuService.getAllMenu();
        const akses = await aksesService.getAksesByLevel(id_level);
        console.log("aksesmenu:", akses);
        // const aksesSubmenu = await aksessubmenuService.getAksessubmenuByLevel(req.session.user.id_level);

        return response.success(res, "User akses fetched", {
          akses,
          menus  // Mengambil dataValues untuk aksesmenu dan menu
        });        
      } catch (error) {
        console.error("Error getUserlevelByLevel:", error);
        return response.error(res, error.message);
      }
  }
  

  async getUserlevelById(req, res) {
    try {
      const {id} = req.params;
      const userlevel = await userlevelService.getUserlevelById(id);
      return response.success(res, "Userlevel fetched", userlevel);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async createUserlevel(req, res) {
    try {
      const userlevel = await userlevelService.createUserlevel(req.body);
      return response.created(res, "Userlevel created", userlevel);
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async updateUserlevel(req, res) {
    try {
      const {id} = req.params;
      await userlevelService.updateUserlevel(id, req.body);
      return response.success(res, "Userlevel updated successfully");
    } catch (error) {
      return response.error(res, error.message, 400);
    }
  }

  async deleteUserlevel(req, res) {
    try {
      const {id} = req.params;
      await userlevelService.deleteUserlevel(id);
      return response.success(res, "Userlevel deleted successfully");
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async upsertAccess(req, res) {
    try {
        const { id_level, akses } = req.body;

        // Validasi ketat: id_level harus ada di body
        if (!id_level) {
            return response.error(res, "ID Level tidak terdeteksi", 400);
        }

        const result = await userlevelService.upsertAccess({ id_level, akses });
        return response.success(res, "Access updated successfully", result);
    } catch (error) {
        return response.error(res, error.message, 400);
    }
}

}

module.exports = new UserlevelController();