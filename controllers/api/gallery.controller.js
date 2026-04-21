const GalleryService = require("../../services/gallery.service");
const { success } = require("../../utils/response");
const GalleryRepository = require("../../repositories/gallery.repository");
const fs = require('fs');
const path = require('path');

class GalleryController {
     async getAllGallery(req, res) {
        try {
          const gallery = await GalleryRepository.getAllGallery();
          return res.status(200).json({
            success: true,
            message: "Gallery fetched successfully",
            data: gallery,
          });
        } catch (error) {
          return res.status(500).json({
             success: false,
             message: "Error fetching menus",
             error: error.message,
          });
        }
      }
    
      async getAllGalleryDatatables(req, res) {
    
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
             const [result, totalCount ] = await Promise.all([ GalleryRepository.getPaginatedGallery({
                    start: parseInt(start, 10) || 0,
                    length: parseInt(length, 10) || 10,
                    search: searchValue,
                    order,
                    columns
                }),
                GalleryRepository.countAll()
            ]);
            // const result = await GalleryRepository.getPaginatedGallery(req.query);
      
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
              message: "Gallery fetched successfully",
              
              draw: parseInt(draw, 10),
              recordsTotal: totalCount,
              recordsFiltered: result.count,
              data
            });
          } catch (error) {
            console.error("Error getAllGalleryDatatables:", error);
            return res.status(500).json({
             success: false,
             message: "Error fetching gallery",
             error: error.message,
          });
        }
      }
    
      async getGalleryById(req, res) {
        try {
          const gallery = await GalleryRepository.getGalleryById(req.params.id);

          if(!gallery) {
            return res.status(404).json({
              success: false,
              message: "Gallery not found"
            })
          }
         return res.status(200).json({
            success: true,
            message: "Gallery ID fetched successfully",
            data: gallery,
          });
        } catch (error) {
          return res.status(500).json({
             success: false,
             message: "Error fetching gallery ID",
             error: error.message,
          });
        }
      }
    
      async createGallery(req, res) {
        const title = req.body.title;

        if (!req.file) {
          return res.status(400).json({ message: 'File wajib diupload' });
        }

        const file_name = req.file.filename;

        const payload = {
          title: title,
          file_name: file_name
        };

        await GalleryRepository.createGallery(payload);

        return res.json({ message: 'Berhasil upload' });
      }

      // async createGallery(req, res) {
      //   console.log("BODY:", req.body);
      //   console.log("FILE:", req.file);

      //   return res.json({
      //     body: req.body,
      //     file: req.file
      //   });
      // }
    
      async updateGallery(req, res) {
        try {
          const { id } = req.params;

          const gallery = await GalleryRepository.getGalleryById(id);

          if (!gallery) {
            return res.status(404).json({
              success: false,
              message: "Gallery tidak ditemukan"
            });
          }

          let file_name = gallery.file_name; // default pakai lama

          // kalau user upload file baru
          if (req.file) {

            // hapus file lama
            const oldPath = path.join(
              __dirname,
              '../../public/assets/img/gallery',
              gallery.file_name
            );

            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }

            // pakai file baru
            file_name = req.file.filename;
          }

          const payload = {
            title: req.body.title,
            file_name: file_name
          };

          const updatedGallery = await GalleryRepository.updateGallery(id, payload);

          return res.status(200).json({
            success: true,
            message: "Gallery berhasil diupdate",
            data: updatedGallery,
          });

        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message || "Terjadi kesalahan saat update data",
          });
        }
      }
    
      async deleteGallery(req, res) {
        try {
          const { id } = req.params;

          // 1. ambil data dulu (buat dapetin nama file)
          const gallery = await GalleryRepository.getGalleryById(id);

          if (!gallery) {
            return res.status(404).json({
              success: false,
              message: "Gallery tidak ditemukan",
            });
          }

          // 2. hapus file dari directory
          const filePath = path.join(
            __dirname,
            '../../public/assets/img/gallery',
            gallery.file_name
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          // 3. hapus dari DB
          const deleted = await GalleryRepository.deleteGallery(id);

          return res.status(200).json({
            success: true,
            message: "Gallery deleted successfully",
            data: deleted,
          });

        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Error deleting gallery",
            error: error.message,
          });
        }
      }
}

module.exports = new GalleryController();