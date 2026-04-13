const CategoryService = require("../../services/category.service");
const { success } = require("../../utils/response");
const CategoryRepository = require("../../repositories/category.repository");

class CategoryController {
     async getAllCategory(req, res) {
        try {
          const category = await CategoryRepository.getAllCategory();
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
            const query = req.query;
             const { draw, start, length, search, order, columns } = query;
             const searchValue =
                  query.search?.value ||
                  query['search[value]'] ||
                  "";
             const [result, totalCount ] = await Promise.all([ CategoryRepository.getPaginatedCategory({
                    start: parseInt(start, 10) || 0,
                    length: parseInt(length, 10) || 10,
                    search: searchValue,
                    order,
                    columns
                }),
                CategoryRepository.countAll()
            ]);
            // const result = await CategoryRepository.getPaginatedCategory(req.query);
      
            // result.data = result.data.map(row => ({
            //   ...row.get({ plain: true }),
            //   akses: {
            //     edit: akses.edit_level === 'Y',
            //     delete: akses.delete_level === 'Y'
            //   }
            // }));
            const data = result.rows.map((row) => ({
                ...row.get({ plain: true }),
                akses: {
                  edit: akses.edit_level === "Y",
                  delete: akses.delete_level === "Y",
                },
              }));

            return res.status(200).json({
              success: true,
              message: "Category fetched successfully",
              
              draw: parseInt(draw, 10),
              recordsTotal: totalCount,
              recordsFiltered: result.count,
              data
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
          const category = await CategoryRepository.getCategoryById(req.params.id);

          if(!category) {
            return res.status(404).json({
              success: false,
              message: "Category not found"
            })
          }
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
         
          const { name, slug } = req.body;
          if (!name || !slug) {
            return res.status(400).json({ success: false, message: "Field name dan slug wajib diisi" });
          }
          const category = await CategoryRepository.createCategory(req.body);
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
          // const category = await CategoryRepository.getCategoryById(id);
          // if(!category){
          //    return res.status(404).json({
          //       success: false,
          //       message:"Kategori tidak ditemukan",
          //   });
          // }

          const updatedCategory = await CategoryRepository.updateCategory(id, req.body);
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
          // const category = await CategoryRepository.getCategoryById(id);
          // if(!category){
          //    return res.status(404).json({
          //       success: false,
          //       message:"Kategori tidak ditemukan",
          //   });
          // }

          const deleted = await CategoryRepository.deleteCategory(id);
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