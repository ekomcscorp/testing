const { response } = require("express");
const productService = require("../../../services/products/product.service");

const handleServerError = (res, error) => {
  console.error("SERVER ERROR:", error);
  return res.status(500).json({ 
    success: false, 
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { error: error.message }) // Tampilkan detail error hanya di mode dev
  });
}

class ProductController {
  // List all products
  async getAllProduct(req, res) {
    try {

      // const {akses} = res.locals;
      // if(akses.view_level !== 'Y') {
      //   return res.status(403).json({ success: false, message: "Akses ditolak" });
      // }

      const products = await productService.getAllProduct(req.user);
      console.log("MASUK PRODUCT CONTROLLER");
      res.json({ 
        success: true, 
        data: products 
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  }

   async getAllProductsDatatables(req, res) {
    try {
      const akses = res.locals.akses || {};

      if (akses.view_level?.trim() !== 'Y') {
        return res.status(403).json({ error: "Akses ditolak" });
      }

      // Add user to the query object
      const query = { ...req.query, user: req.user };
      const result = await productService.getAllProductsDatatables(query);

      result.data = result.data.map(row => ({
        ...row.get({ plain: true }),
        akses: {
          edit: akses.edit_level === 'Y',
          delete: akses.delete_level === 'Y'
        }
      }))
      console.log("QUERY:", req.query);
     return res.json({
      success: true,
      message: "Product fetched successfully",
      draw: result.draw,
      recordsTotal: result.recordsTotal,
      recordsFiltered: result.recordsFiltered,
      data: result.data
    });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: "Internal Server Error",
        error: error.message
       });
    }
  }
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      return handleServerError(res, error);
    }
  }

  // Create new product
  async createProduct(req, res) {
  try {
    const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
    
    console.log("SESSION USER:", req.user);
    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);
    let hotels = JSON.parse(req.body.hotels || "[]");

    hotels = hotels.map(hotel => {
      if (hotel.city === "Mekkah" && req.files?.hotel_image_mekkah) {
        // Ambil nama file yang disimpan multer (misal: hotel-123.jpg)
          hotel.image = req.files.hotel_image_mekkah[0].filename; 
      }
      if (hotel.city === "Madinah" && req.files?.hotel_image_madinah){
          hotel.image = req.files.hotel_image_madinah[0].filename;
      }
         return hotel;
    })

    const thumbnailFile = req.files?.thumbnail?.[0]?.filename || null;

    const productData = {
      ...req.body,
      thumbnail_url: thumbnailFile,
      prices: JSON.parse(req.body.prices || "[]"),
      flights: JSON.parse(req.body.flights || "[]"),
      hotels: hotels,
      itineraries: JSON.parse(req.body.itineraries || "[]"),
      snks: JSON.parse(req.body.snks || "[]"),
      notes: JSON.parse(req.body.notes || "[]"),
    };

    // // Validasi status
    // const validStatuses = ['draft', 'publish', 'closed'];
    // if (productData.status && !validStatuses.includes(productData.status?.toLowerCase())) {
    //     return res.status(400).json({ 
    //         success: false, 
    //         message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` 
    //     });
    // }

    const product = await productService.createProduct(productData, userId);

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message:  error.message || "Gagal menyimpan produk karena terjadi kesalahan saat menyimpan data",

    });
  }
}


  // Update product
  async updateProduct(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // ✅ Parse hotels dulu untuk inject image
        let hotels = JSON.parse(req.body.hotels || "[]");
        hotels = hotels.map(hotel => {
            if (hotel.city === "Mekkah") {
                hotel.image = req.files?.hotel_image_mekkah
                    ? req.files.hotel_image_mekkah[0].filename
                    : hotel.existing_image || hotel.image || null;
            }
            if (hotel.city === "Madinah") {
                hotel.image = req.files?.hotel_image_madinah
                    ? req.files.hotel_image_madinah[0].filename
                    : hotel.existing_image || hotel.image || null;
            }
            return hotel;
        });

        const productData = {
            ...req.body,
            prices: JSON.parse(req.body.prices || "[]"),
            flights: JSON.parse(req.body.flights || "[]"),
            hotels: hotels,
            itineraries: JSON.parse(req.body.itineraries || "[]"),
            snks: JSON.parse(req.body.snks || "[]"),
            notes: JSON.parse(req.body.notes || "[]"),
            facilities: JSON.parse(req.body.facilities || "[]"),
        };

        // Validasi status
        const validStatuses = ['draft', 'publish', 'closed'];
        if (productData.status && !validStatuses.includes(productData.status?.toLowerCase())) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` 
            });
        }

        // ✅ Handle thumbnail baru
        if (req.files?.thumbnail) {
            productData.thumbnail_url = req.files.thumbnail[0].filename;
        }

        const updated = await productService.updateProduct(id, productData);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product updated" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message:  error.message || "Terjadi kesalahan saat memperbarui data" });
    }
}

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deleted = await productService.deleteByProduct(id);
      
      if (!deleted) {
        // Menggunakan format status: "error"
        return res.status(404).json({ status: "error", message: "Product not found" });
      }

      // Menggunakan format status: "success"
      return res.json({ success: true, message: "Product deleted" });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, message: error.message ||  "Terjadi kesalahan saat menyimpan data" });
    }
  }
  
  // Update product status (publish/draft/closed)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

      const updated = await productService.updateStatus(id, status);
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });

      // Emit socket event to admin (if socket util available)
      try {
        const { getIO } = require('../../../utils/socketIO');
        const io = getIO();
        io.to('admin').emit('product_status_changed', { id: updated.id, status: updated.status });
      } catch (e) {
        // ignore if socket not initialized
      }

      return res.json({ success: true, message: 'Status updated', data: updated });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  // Get products for landing page
  async getProductForLanding(req, res) {
    try {
      const products = await productService.getProductForLanding();
      res.json({ success: true, data: products });
    } catch (error) {
      return handleServerError(res, error);
    }
  }
  // Datatables endpoint
 
}

module.exports = new ProductController();
