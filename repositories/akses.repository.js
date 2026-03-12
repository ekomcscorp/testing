const { where } = require("sequelize");
const { Akses, Menu } = require("../models");

class AksesRepository{
    async getAllAkses() {
        return await Akses.findAll();
    }

    async getAksesById(id) {
        return await Akses.findByPk(id);
    }

    async createAkses(aksesData){
        return await Akses.create(aksesData);
    }
    async updateAkses(id, aksesData){
        return await Akses.update(aksesData, { where: { id } });
    }
    
    async deleteAkses(id){
        return await Akses.destroy({ where: { id } });
    }
    async getAksesByLevel(id_level) {
        return await Menu.findAll({
           include: [{
                model: Akses,
                required: false,
                where: { id_level: id_level}
           }],
        });
    }
    async deleteAksesById_menu(id_menu, transaction) {
        return await Akses.destroy({
            where: { id_menu },
            transaction
        })
    }
    async upsert (data, options){
        const { id, id_level, id_menu, level, status } = data;
        try{
            const [akses] = await Akses.upsert(
                {
                    id,
                    id_level,
                    id_menu,
                    [level]: status // Menggunakan computed property untuk level,
                },
                {
                    returning: true,
                    ...options
                }
            );

        return akses;
        } catch (error){
            throw new Error('Failed to upsert Akses: ' + error.message);
        }
    }
}

module.exports = new AksesRepository();