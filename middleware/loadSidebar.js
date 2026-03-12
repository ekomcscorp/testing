const { Menu, Akses} = require('../models');


const buildTree = (menus, parentId = null) => {
      return menus
        .filter(menu => menu.parent_id === parentId)
        .map(menu => ({
          id_menu: menu.id_menu,
          nama_menu: menu.nama_menu,
          icon: menu.icon,
          link: menu.link,
          urutan: menu.urutan,
          is_active: menu.is_active,
          children: buildTree(menus, menu.id_menu)
        }))
      .sort((a, b) => a.urutan - b.urutan);
    }

const markActive = (menus, currentUrl) => {
  return menus.map(menu => {
    const isActive = currentUrl.startsWith(menu.link);

    const children = markActive(menu.children || [], currentUrl);

    const isChildActive = children.some(child => child.isActive);

    return {
      ...menu,
      isActive: isActive || isChildActive,
      children
    };
  });
};

const loadSidebar = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (!user) {
      res.locals.sidebarMenus = [];
      return next();
    }

    const idlevel = user.id_level;

    // Ambil semua menu sesuai hak akses user
    const aksesMenus = await Akses.findAll({
      where: {
        id_level: idlevel,
        view_level: 'Y', // Pastikan hanya mengambil menu dengan view_level = 'Y'
      },
      include: [
        {
          model: Menu,
          where: { is_active: 'Y' },
          required: true,
          
        },
      ],
      order: [[{ model: Menu }, 'urutan', 'ASC']],
    });

    const menuMap = {};
    aksesMenus.forEach(akses => {
      if(!menuMap[akses.Menu.id_menu]){
        menuMap[akses.Menu.id_menu] = akses.Menu;
      }
    }) 
 

    if(!aksesMenus.length){
      res.locals.sidebarMenus = [];
      return next();
    }

    // const rawMenus = await menuService.getAllMenu();
    // const menuMap = {};

    // rawMenus.forEach(menu => {
    //   menu.children = [];
    //   menuMap[menu.id_menu] = menu;
    // });

    // const menuTree = [];
    // rawMenus.forEach(menu => {
    //   if(menu.parent_id) {
    //     if(menuMap[menu.parent_id]){
    //       menuMap[menu.parent_id].children.push(menu);
    //     }
    //   } else {
    //     menuTree.push(menu);
    //   }
    // });
    
    
  const menus = Object.values(menuMap);

  const tree = buildTree(menus);

  // 🔥 Tambahkan ini
  const currentUrl = req.originalUrl;

  res.locals.sidebarMenus = markActive(tree, currentUrl);

  next();
  } catch (error) {
    console.error('❌ Error loading sidebar:', error);
    next(error);
  }
};

module.exports = loadSidebar;
