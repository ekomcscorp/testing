const { response } = require("express");
const productService = require("../../../services/products/product.service");

class ProductController {
  // List all products
  async getAllProduct(req, res) {
    try {

      // const {akses} = res.locals;
      // if(akses.view_level !== 'Y') {
      //   return res.status(403).json({ success: false, message: "Akses ditolak" });
      // }

      const products = await productService.getAllProduct();
      res.json({ success: true, data: products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  //  async getAllProductsDatatables(req, res) {
  //   try {
  //     const {akses} = res.locals.akses || {};

  //     if (akses.view_level !== 'Y') {
  //       return res.status(403).json({ error: "Akses ditolak" });
  //     }

  //     const result = await productService.getAllProductsDatatables(req.query);

  //     result.data = result.data.map(row => ({
  //       ...row.get({ plain: true }),
  //       akses: {
  //         edit: akses.edit_level === 'Y',
  //         delete: akses.delete_level === 'Y'
  //       }
  //     }))

  //     return response.datatables(res, result)
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ success: false, message: "Internal Server Error" });
  //   }
  //}
  async getAllProductsDatatables(req, res) {
  try {
    // 1. Ambil langsung objek akses dari res.locals
    // Jika res.locals.akses tidak ada, gunakan objek kosong {} agar .view_level tidak crash
    const akses = res.locals.akses || {};

    // 2. Cek izin akses
    if (akses.view_level !== 'Y') {
      return res.status(403).json({ error: "Akses ditolak" });
    }

    const result = await productService.getAllProductsDatatables(req.query);

    // 3. Pastikan result.data ada sebelum di-map
    if (result && result.data) {
      result.data = result.data.map(row => {
        // Gunakan pengecekan instance sequelize agar .get() tidak error
        const plainData = typeof row.get === 'function' ? row.get({ plain: true }) : row;
        
        return {
          ...plainData,
          akses: {
            edit: akses.edit_level === 'Y',
            delete: akses.delete_level === 'Y'
          }
        };
      });
    }

    return res.json({
    draw: result.draw,
    recordsTotal: result.recordsTotal,
    recordsFiltered: result.recordsFiltered,
    data: result.data
});
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  // Create new product
  async createProduct(req, res) {
  try {
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

    const productData = {
      ...req.body,
      prices: JSON.parse(req.body.prices || "[]"),
      flights: JSON.parse(req.body.flights || "[]"),
      hotels: hotels,
      itineraries: JSON.parse(req.body.itineraries || "[]"),
      snks: JSON.parse(req.body.snks || "[]"),
      notes: JSON.parse(req.body.notes || "[]"),
    };

    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
}


  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const updated = await productService.updateProduct(id, productData);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.json({ success: true, message: "Product updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
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
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
  // Datatables endpoint
 
}

module.exports = new ProductController();
