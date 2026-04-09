const { Op } = require("sequelize");
const { sequelize, Userlevel, Akses } = require("../models");

class UserlevelRepository {

  async getAllUserlevels() {
    return await Userlevel.findAll();
  }


  async getPaginatedUserlevels({ start, length, search, order, columns }) {
    try {
      console.log("Repository - getPaginatedUserlevels params:", {
        start, length, search, order, columns
      });
      
      const where = {
        ...(search && {
          [Op.or]: [
            { id_level: { [Op.like]: `%${search}%` } },
            { nama_level: { [Op.like]: `%${search}%` } }
          ]
        })
      };

    const sort =
      order && order.length > 0
        ? [[columns[order[0].column].data, order[0].dir]]
        : [["created_at", "DESC"]];

    const offset = start || 0;
    const limit = length || 10;

      const result = await Userlevel.findAndCountAll({
        where,
        order: sort,
        offset,
        limit
      });

      console.log("Repository result:", {
        count: result.count,
        rowsLength: result.rows.length
      });

      return result;
    } catch (error) {
      console.error("Repository error in getPaginatedUserlevels:", error.message);
      throw error;
    }
  }


  async getUserlevelById(id_level) {
    return await Userlevel.findByPk(id_level);
  }


  async createUserlevel(data) {
    return await Userlevel.create(data);
  }


  async updateUserlevel(id_level, data) {
    return await Userlevel.update(data, { where: { id_level } });
  }


  async deleteUserlevel(id_level) {
    return await Userlevel.destroy({ where: { id_level } });
  }



  /**
   * ================================
   * REFACTOR UPSERT ACCESS (FINAL)
   * ================================
   * Struktur aksesList dari frontend:
   * [
   *   { id: 5, id_menu: 3, view_level: 'Y' },
   *   { id: null, id_menu: 7, edit_level: 'Y' },
   * ]
   */
  async upsertAccess(id_level, aksesList) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Validasi id_level
      if (!id_level) {
        throw new Error("id_level is required");
      }

      // 2. Hapus SEMUA akses lama untuk level ini dalam transaksi
      await Akses.destroy({
        where: { id_level: id_level },
        transaction
      });

      // 3. Siapkan data baru untuk di-bulk insert
      const newData = aksesList.map(akses => ({
        id_level: id_level,
        id_menu: akses.id_menu,
        view_level: akses.view_level || 'N',
        add_level: akses.add_level || 'N',
        edit_level: akses.edit_level || 'N',
        delete_level: akses.delete_level || 'N',
        print_level: akses.print_level || 'N',
        upload_level: akses.upload_level || 'N'
      }));

      // 4. Masukkan semua data baru sekaligus
      if (newData.length > 0) {
        await Akses.bulkCreate(newData, { transaction });
      }

      await transaction.commit();
      return { message: "Akses berhasil diperbarui" };

    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error in upsertAccess Repository:", error);
      throw error;
    }
  }

}

module.exports = new UserlevelRepository();
