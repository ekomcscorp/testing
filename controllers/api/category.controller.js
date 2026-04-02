const CategoryService = require("../../services/category.service");
const { success } = require("../../utils/response");

class CategoryController {
     async getAllCategory(req, res) {
        try {
          const category = await CategoryService.getAllCategory();
          return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category,
          });
        } catch (error) {
          return res.status(500).json({
             success: false,
             message: "Error fetching menus",
             error: error.message,
          });
        }
      }
    
      async getAllCategoryDatatables(req, res) {
    
        try {
          const { akses } = res.locals;
    
            if (akses.view_level?.trim() !== 'Y') {
              return res.status(403).json({ error: "Akses ditolak" });
            }
      
            const result = await CategoryService.getAllCategoryDatatables(req.query);
      
            // result.data = result.data.map(row => ({
            //   ...row.get({ plain: true }),
            //   akses: {
            //     edit: akses.edit_level === 'Y',
            //     delete: akses.delete_level === 'Y'
            //   }
            // }));
            const data = result.data.map(row => ({
              ...row.get({plain: true}),
              akses: {
                edit: akses.edit_level === "Y",
                delete: akses.delete_level === "Y"
              }
            }));

            return res.status(200).json({
              success: true,
              message: "Category fetched successfully",
              data: data,
              draw: result.draw,
              recordsTotal: result.recordsTotal,
              recordsFiltered: result.recordsFiltered
            });
          } catch (error) {
            console.error("Error getAllCategoryDatatables:", error);
            return res.status(500).json({
             success: false,
             message: "Error fetching category",
             error: error.message,
          });
        }
      }
    
      async getCategoryById(req, res) {
        try {
          const category = await CategoryService.getCategoryById(req.params.id);
         return res.status(200).json({
            success: true,
            message: "Category ID fetched successfully",
            data: category,
          });
        } catch (error) {
          return res.status(500).json({
             success: false,
             message: "Error fetching category ID",
             error: error.message,
          });
        }
      }
    
      async createCategory(req, res) {
        try {
          const category = await CategoryService.createCategory(req.body);
          return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category,
          });
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message || "Terjadi kesalahan saat menyimpan data",
          });
        }
      }
    
      async updateCategory(req, res) {
        try {
          const {id} = req.params;
          const category = await CategoryService.getCategoryById(id);
          if(!category){
             return res.status(404).json({
                success: false,
                message:"Kategori tidak ditemukan",
            });
          }

          const updatedCategory = await CategoryService.updateCategory(id, req.body);
          return res.status(200).json({
            success: true,
            message: "Category berhasil diupdate",
            data: updatedCategory,
          });
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message || "Terjadi kesalahan saat menyimpan data",
          });
        }
      }
    
      async deleteCategory(req, res) {
        try {
          const {id} = req.params;
          const category = await CategoryService.getCategoryById(id);
          if(!category){
             return res.status(404).json({
                success: false,
                message:"Kategori tidak ditemukan",
            });
          }

          const deleted = await CategoryService.deleteCategory(req.params.id);
           return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: deleted,
          });
        } catch (error) {
          return res.status(500).json({
             success: false,
             message: "Error fetching category",
             error: error.message,
          });
        }
      }
}

module.exports = new CategoryController();