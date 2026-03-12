const { Aksessubmenu, Submenu } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const user = req.session.user;

    if (!user) {
      res.locals.akses = {}; // default kosong
      return next();
    }

    // ambil semua hak akses submenu berdasarkan level user
    const aksesList = await Aksessubmenu.findAll({
      where: { id_level: user.id_level },
      include: {
        model: Submenu,
        attributes: ["link"],
        where: { is_active: 'Y' },
      },
    });

    // mapping: { '/path/to/page': { view_level: 'Y', ... } }
    const aksesSubmenu = {};
    aksesList.forEach((item) => {
      if (item.Submenu && item.Submenu.link) {
        aksesSubmenu[item.Submenu.link] = {
          view_level: item.view_level,
          add_level: item.add_level,
          edit_level: item.edit_level,
          delete_level: item.delete_level,
          print_level: item.print_level,
          upload_level: item.upload_level,
        };
      }
    });

    let currentPath = req.baseUrl.replace(/^\/api/, "");
    const parts = currentPath.split("/").filter(Boolean);

    // console.log(parts.length, currentPath, parts);

    if (parts.length > 0) {
      currentPath = "/" + parts[parts.length - 1]; // Ambil bagian terakhir
    } else {
      currentPath = "/";
    }

    res.locals.akses = aksesSubmenu[currentPath] || {
      view_level: 'N',
      add_level: 'N',
      edit_level: 'N',
      delete_level: 'N',
      print_level: 'N',
      upload_level: 'N',
    };

    // juga inject info user
    res.locals.username = user.username || null;
    res.locals.fullname = user.fullname || null;
    res.locals.id_level = user.id_level || null;
    next();
  } catch (error) {
    console.error("Error in injectUser middleware:", error);
    next(error);
  }
};
