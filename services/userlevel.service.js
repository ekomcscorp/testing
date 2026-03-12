const { Op } = require("sequelize");
const { Userlevel } = require("../models");
const UserlevelRepository = require("../repositories/userlevel.repository");
const userlevelRepository = require("../repositories/userlevel.repository");
const aksesRepository = require("../repositories/akses.repository");


class UserlevelService {
  async getAllUserlevel() {
    const userlevel = await UserlevelRepository.getAllUserlevels();
    return userlevel || []; // jika null/undefined, tetap kembalikan array kosong
  }

  async getAllUserlevelDatatables({ draw, start, length, search, order, columns, id_level }) {
    const searchValue = search?.value || "";
  
    const { count, rows } = await UserlevelRepository.getPaginatedUserlevels({
      start: parseInt(start, 10) || 0,
      length: parseInt(length, 10) || 10,
      search: searchValue,
      order,
      columns,
      id_level
    });
  
    return {
      draw: parseInt(draw, 10) || 0,
      recordsTotal: count,
      recordsFiltered: count,
      data: rows,
    };
  }

  async getUserlevelById(id_level) {
    const userlevel = await userlevelRepository.getUserlevelById(id_level);
    return userlevel || []; // jika null/undefined, tetap kembalikan array kosong
  }

  async createUserlevel(userlevelData) {
    const requiredFields = ["nama_level"];
    if (!requiredFields.every(field => userlevelData[field])) {
      throw new Error("Semua field wajib diisi");
    }
    return await UserlevelRepository.createUserlevel(userlevelData);
  }

  async updateUserlevel(id_level, userlevelData) {
    const userlevel = await UserlevelRepository.getUserlevelById(id_level);
    if (!userlevel) {
      throw new Error("Userlevel not found");
    }
    return await UserlevelRepository.updateUserlevel(id_level, userlevelData);
  }

  async deleteUserlevel(id_level) {
    const userlevel = await UserlevelRepository.getUserlevelById(id_level);
    if (!userlevel) {
      throw new Error("Userlevel not found");
    }
    return await UserlevelRepository.deleteUserlevel(id_level);
  }

  async upsertAccess(data) {
    const { id_level, akses } = data;
  
    if (!id_level || !Array.isArray(akses)) {
      throw new Error("id_level dan akses wajib diisi");
    }

    // console.log("id_level2", id_level);
    // console.log("akses2", akses);
  
    // Kirim ke repository untuk handle transaction upsert aksesmenu + aksessubmenu
    const result = await userlevelRepository.upsertAccess(id_level, akses);
  
    return result;
  }
  
}

module.exports = new UserlevelService();