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
        await Akses.update(aksesData, { where: { id } });

        return await Akses.findByPk(id);
    }
    
    async deleteAkses(id){
        return await Akses.destroy({ where: { id } });
    }
    async getAksesByLevel(id_level) {
        return await Akses.findAll({
           where:{ id_level},
           include: [{
                model: Menu,
                required: true,
                
           }],
        });
    }
    async deleteAksesById_menu(id_menu, transaction) {
        return await Akses.destroy({
            where: { id_menu },
            transaction
        })
    }
    async upsert (options={}){
        const columnMap = {
            view: "view_level",
            add: "add_level",
            edit: "edit_level",
            delete: "delete_level",
            print: "print_level",
            upload: "upload_level"
            };

            const column = columnMap[level];

            if(!column){
            throw new Error("Invalid akses level");
            }

            const [akses] = await Akses.upsert(
                {
                    id,
                    id_level,
                    id_menu,
                    [column]: status
                },
                {
                    returning: true,
                    ...options
                }
            );
            return akses;
        }
}

module.exports = new AksesRepository();