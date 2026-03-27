const { Akses, Menu } = require('../models');
const AksesRepository = require('../repositories/akses.repository');

class AksesService {
    async getAllAkses() {
        const akses = await AksesRepository.getAllAkses();
         return akses;
    }
    async getAksesById(id) {
        return await AksesRepository.getAksesById(id);
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

    async upsertAkses(id_level, menuId, payload){
        return await Akses.upsert({
            id_level: id_level,
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
            view_level: row.view_level?.trim(),
            add_level: row.add_level?.trim(),
            edit_level: row.edit_level?.trim(),
            delete_level: row.delete_level?.trim(),
            print_level: row.print_level?.trim(),
            upload_level: row.upload_level?.trim(),
        }))
    }
}

module.exports = new AksesService();