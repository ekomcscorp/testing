const aksesService = require('../../services/akses.service');
const response = require('../../utils/response');

class AksesController {
    async getAllAkses(req, res){
        try{
            const akses = await aksesService.getAllAkses();
            return response.success(res, "All akses fetched", akses);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async getAksesById(req, res){
        try{
            const {id} = req.params;
            const akses = await aksesService.getAksesById(req.params.id);

           return res.status(200).json({
            success: true,
            message: "Menu fetched successfully",
            data: menu,
            });

        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async getAksesByLevel(req, res){
        try{
            const {id_level} = req.params;
            const akses = await aksesService.getAksesByLevel(id_level);
               return res.json({
                success: true,
                data: akses
                });
        } catch (error) {
           return res.status(500).json({
            success: false,
            message: error.message
           });
        }
    }

    async createAkses(req, res) {
        try {
            const akses = await aksesService.createAkses(req.body);
            return response.created(res, "Akses created", akses);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    async updateAkses(req, res) {
        try {
            await aksesService.updateAkses(req.params.id, req.body);
            return response.success(res, "Akses updated successfully");
        } catch (error) {
            return response.error(res, error.message, 400); 
        }
    }

    async deteleAkses(req, res) {
        try{
            await aksesService.deleteAkses(req.params.id);
            return response.success(res, "Akses deleted successfully");
        } catch (error){
            return response.notFound (res, error.message);
        }
    }
}

module.exports = new AksesController();