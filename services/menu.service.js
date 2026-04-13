// const MenuRepository = require("../repositories/menu.repository");
// const { mapMenuWithAcces } = require("../utils/menuAcces");


// class MenuService {
//   async getAllMenu() {
//     const menu = await MenuRepository.getAllMenu();
//     return menu; // jika null/undefined, tetap kembalikan array kosong
//   }
  
//   async getSubmenu(){
//     return await MenuRepository.getSubmenu();
//   }

//   async getMenuById(id_menu) {
//     return await MenuRepository.getMenuById(id_menu); // jika null/undefined, tetap kembalikan array kosong
//   }

//   async getAllMenuDatatables(query) {
//     const { draw, start, length, search, order, columns, parent_id, parent_not_null } = query;
//     const searchValue =
//             query.search?.value ||
//             query['search[value]'] ||
//             "";

//     const filter = {};
    
//     if( parent_id === null) {
//       filter.parent_id = null;
//     }
    
//     if(parent_not_null){
//       filter.parent_not_null = true;
//     }

//     const { count, rows } = await MenuRepository.getPaginatedMenu({
//       start: parseInt(start, 10) || 0,
//       length: parseInt(length, 10) || 10,
//       search: searchValue,
//       order,
//       columns,
//       filter
//     });

//     return {
//       draw: parseInt(draw, 10),
//       recordsTotal: count,
//       recordsFiltered: count,
//       data: rows
//     };
//   }

//   async getParentsMenusDatatable(id_level) {
//     const menus = await MenuRepository.getParentMenus(id_level);
//     return menus.map(menu => mapMenuWithAcces(menu));
//   }

//   async getSubmenuDatatables(query) {
//     return await this.getAllMenuDatatables({
//       ...query,
//       parent_not_null: true
//     });
//   }
  
//   async createMenu(menuData) {
//     const requiredFields = ["nama_menu", "link", "icon", "urutan", "is_active"];
//      for(const field of requiredFields){
//       if(menuData[field] === undefined){
//         throw new Error(`${field} wajib diisi`);
//       }
//      }

//      const parentId = menuData.parent_id ?? null;
//      return await MenuRepository.createMenu({
//       ...menuData,
//       parent_id: parentId
//      });
//   }

//   async updateMenu(id_menu, menuData) {
//     const menu = await MenuRepository.getMenuById(id_menu);

//     if (!menu) {
//       throw new Error("Menu not found");
//     }
//     const parentId = menuData.parent_id ?? null;

//     const updated = await MenuRepository.updateMenu(id_menu, {
//       ...menuData,
//       parent_id: parentId
//     });
//     return updated;
//   }

//   async deleteMenu(id_menu) {
//     const menu = await MenuRepository.getMenuById(id_menu);
//     if (!menu) {
//       throw new Error("Menu not found");
//     }
    
//     await MenuRepository.deleteMenu(id_menu);

//     return { message: "Menu deleted successfully" };
//   }

//   // 🆕 Fungsi baru: Ambil menu dalam struktur bertingkat (multi-level)
//   async getNestedMenu() {
//     const menus = await MenuRepository.getAllMenu();
//     //recursive builder
//     const buildTree = (parentId = null) => {
//       return menus
//         .filter(menu => menu.parent_id === parentId)
//         .map(menu => ({
//           id_menu: menu.id_menu,
//           nama_menu: menu.nama_menu,
//           icon: menu.icon,
//           link: menu.link,
//           urutan: menu.urutan,
//           is_active: menu.is_active,
//           children: buildTree(menu.id_menu)
//         }))
//     }
    
//     return buildTree(null);
//   }

//   async createNestedMenu(menuData, parentId = null){
//     const newMenu = await MenuRepository.createMenu({
//       nama_menu: menuData.nama_menu,
//       link: menuData.link,
//       icon: menuData.icon,
//       urutan: menuData.urutan,
//       is_active: menuData.is_active,
//       parent_id: parentId
//     })
//       if (menuData.children && menuData.children.length > 0){
//       for(const child of menuData.children){
//         await this.createNestedMenu(child, 
//           newMenu.id_menu);
//       }
//     }
//     return newMenu;
//   }

  

// }

// module.exports = new MenuService();