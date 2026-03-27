const { Menu, Akses } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const user = req.session.user;

    // Kalau belum login → set default akses N
    if (!user) {
      res.locals.akses = getDefaultAkses();
      return next();
    }

    let currentPath = req.originalUrl.replace(/\?.*$/, ""); 
    currentPath = currentPath.replace(/^\/api/, "");

    if (currentPath.includes("/datatables")) {

      // hapus /datatables dari path
      const menuPath = currentPath.replace("/datatables", "");

      const aksesData = await Akses.findOne({
        where: { id_level: user.id_level },
        include: {
          model: Menu,
          attributes: ["link"],
          where: { link: menuPath }
        }
      });

      if (aksesData) {
        res.locals.akses = {
          view_level: aksesData.view_level,
          add_level: aksesData.add_level,
          edit_level: aksesData.edit_level,
          delete_level: aksesData.delete_level,
          print_level: aksesData.print_level,
          upload_level: aksesData.upload_level
        };
      } else {
        res.locals.akses = getDefaultAkses();
      }

      return next();
    }
    
    // SUPERADMIN → full akses
    if (user.id_level === 6) {
      res.locals.akses = getFullAkses();
      res.locals.user = user;
      return next();
    }

    // Ambil akses dari DB
    const aksesList = await Akses.findAll({
      where: { id_level: user.id_level },
      include: {
        model: Menu,
        attributes: ["link"],
        where: { is_active: "Y" },
      },
    });

    // Mapping
    const aksesMap = {};
    for (const row of aksesList){
      if(!Menu || !row.Menu.link) continue;

      let link = row.Menu.link.trim();

      if( link === "#" || link === "" ) continue;

      if(!link.startsWith("/")) link = "/" + link;

       aksesMap[link] = {
          view_level: row.view_level,
          add_level: row.add_level,
          edit_level: row.edit_level,
          delete_level: row.delete_level,
          print_level: row.print_level,
          upload_level: row.upload_level,
      };
    }

    // Cari matching akses berdasarkan link terpanjang
    const akses = matchAkses(currentPath, aksesMap) || getDefaultAkses()
    ;
    

    res.locals.akses = akses;
    res.locals.username = user.username;
    res.locals.fullname = user.fullname;
    res.locals.id_level = user.id_level;

    next();
  } catch (err) {
    console.error("injectUser error:", err);
    next(err);
  }
};

// Helpers
function getDefaultAkses() {
  return {
    view_level: "N",
    add_level: "N",
    edit_level: "N",
    delete_level: "N",
    print_level: "N",
    upload_level: "N",
  };
}

function getFullAkses() {
  return {
    view_level: "Y",
    add_level: "Y",
    edit_level: "Y",
    delete_level: "Y",
    print_level: "Y",
    upload_level: "Y",
  };
}

function matchAkses(currentPath, aksesMap) {
  let bestMatch = null;
  let longest = 0;

  for(const link in aksesMap){
    if(currentPath.startsWith(link) && link.length > longest ){
      bestMatch = aksesMap[link];
      longest = link.length;
    }
    return bestMatch;
  }
}
