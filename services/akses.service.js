const { Akses, Menu } = require('../models');
const AksesRepository = require('../repositories/akses.repository');

class AksesService {
    async getAllAkses() {
        const akses = await AksesRepository.getAllAkses();
         if (akses.length === 0) {
            throw new Error("No akses found");
        }
         return akses;
    }
    async getAksesById(id) {
        const akses = await AksesRepository.getAksesById(id);
        if (!akses) {
            throw new Error("Akses not found");
        }
        return akses;
    }
    async createAkses(aksesData){
        const requiredFields = ["id_level", "id_menu", "view_level"];
        if (!requiredFields.every(field => aksesData[field])) {
          throw new Error("Semua field wajib diisi");
        }
        return await AksesRepository.createAkses(aksesData);
    }
    async updateAkses(id, aksesData){
        const akses = await AksesRepository.getAksesById(id);
        if (!akses) {
            throw new Error("Akses not found");
        }
        return await AksesRepository.updateAkses(id, aksesData);
    }
    async deleteAkses(id) {
        const akses = await AksesRepository.getAksesById(id);
        if (!akses) {
            throw new Error("Akses not found");
        }
        return await AksesRepository.deleteAkses(id);
    }

    async upsertAkses(level, menuId, payload){
        return await Akses.upsert({
            id_level: level,
            id_menu: menuId,
            ...payload
        })
    }

     async getAksesByLevel(id_level) {
        const rows = await Akses.findAll({
            where: { id_level: id_level},
            include: [{
                model: Menu,
                attributes: ['id_menu', 'nama_menu', 'link', ],
                where: { is_active: 'Y' }
            }]
        });
        return rows.filter((row) => row.Menu && row.Menu.link !== "#").map((row) => ({
            id: row.id,
            id_menu: row.id_menu,
            nama_menu: row.Menu.nama_menu,
            link: row.Menu.link,
            view_level: row.view_level,
            add_level: row.add_level,
            edit_level: row.edit_level,
            delete_level: row.delete_level,
            print_level: row.print_level,
            upload_level: row.upload_level,
        }))
    }
}

module.exports = new AksesService();