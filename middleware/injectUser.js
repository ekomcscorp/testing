const { Menu, Akses } = require("../models");
const { Op } = require("sequelize");

module.exports = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      res.locals.akses = getDefaultAkses();
      return next();
    }

    let currentPath = req.originalUrl.replace(/\?.*$/, "");
    currentPath = currentPath.replace(/^\/api/, "");
    // Hapus trailing slash
    if (currentPath.length > 1 && currentPath.endsWith("/")) {
      currentPath = currentPath.slice(0, -1);
    }

    // ─── Handler khusus path /datatables ───
    if (currentPath.includes("/datatables")) {

      let menuPath = currentPath.replace(/\/datatables$/, "");
      if (!menuPath.startsWith("/")) menuPath = "/" + menuPath;
      menuPath = menuPath.replace(/\/+$/, "");

      // Ambil SEMUA akses untuk level ini (bukan cari 1 row spesifik)
      const aksesList = await Akses.findAll({
        where: { id_level: user.id_level },
        include: {
          model: Menu,
          attributes: ["link"],
          where: { is_active: "Y" },
        },
      });

      const aksesMap = {};
      for (const row of aksesList) {
        if (!row.Menu || !row.Menu.link) continue;
        let link = row.Menu.link.trim();
        if (link === "#" || link === "" || link.startsWith("#")) continue;
        if (!link.startsWith("/")) link = "/" + link;

        aksesMap[link] = {
          view_level: row.view_level?.trim() ?? "N",
          add_level: row.add_level?.trim() ?? "N",
          edit_level: row.edit_level?.trim() ?? "N",
          delete_level: row.delete_level?.trim() ?? "N",
          print_level: row.print_level?.trim() ?? "N",
          upload_level: row.upload_level?.trim() ?? "N",
        };
      }

      // pakai ulang matchAkses (longest-prefix), sama kayak branch non-datatables
      res.locals.akses = matchAkses(menuPath, aksesMap) || getDefaultAkses();

      console.log(`[RBAC /datatables] path: ${menuPath} | matched akses:`, res.locals.akses);
      return next();
    }

    // ─── Superadmin → full akses ───
    if (user.id_level === 1) {
      res.locals.akses = getFullAkses();
      res.locals.user = user;
      return next();
    }

    // ─── User biasa: ambil akses dari DB ───
    const aksesList = await Akses.findAll({
      where: { id_level: user.id_level },
      include: {
        model: Menu,
        attributes: ["link"],
        where: { is_active: "Y" },
      },
    });

    const aksesMap = {};
    for (const row of aksesList){
      if(!row.Menu || !row.Menu.link) continue;

      let link = row.Menu.link.trim();
      if (link === "#" || link === "") continue;
      if (!link.startsWith("/")) link = "/" + link;

      if( link === "#" || link === "" ) continue;

      if(!link.startsWith("/")) link = "/" + link;

       aksesMap[link] = {
          view_level: row.view_level?.trim(),
          add_level: row.add_level?.trim(),
          edit_level: row.edit_level?.trim(),
          delete_level: row.delete_level?.trim(),
          print_level: row.print_level?.trim(),
          upload_level: row.upload_level?.trim(),
      };
    }

    const akses = matchAkses(currentPath, aksesMap) || getDefaultAkses();
    console.log(`[RBAC] path: ${currentPath} | level: ${user.id_level} | akses:`, akses);

    res.locals.akses   = akses;
    res.locals.username = user.username;
    res.locals.fullname = user.fullname;
    res.locals.id_level = user.id_level;

    next();
  } catch (err) {
    console.error("injectUser error:", err);
    next(err);
  }
};

function getDefaultAkses() {
  return { 
    view_level:"N", 
    add_level:"N", 
    edit_level:"N", 
    delete_level:"N", 
    print_level:"N", 
    upload_level:"N"
   };
}

function getFullAkses() {
  return { 
    view_level:"Y", 
    add_level:"Y", 
    edit_level:"Y", 
    delete_level:"Y", 
    print_level:"Y", 
    upload_level:"Y" 
  };
}

// ✅ Fix Bug #1: return di LUAR loop
function matchAkses(currentPath, aksesMap) {
  let bestMatch = null;
  let longest = 0;

  for (const link in aksesMap) {
    if (currentPath.startsWith(link) && link.length > longest) {
      bestMatch = aksesMap[link];
      longest = link.length;
    }
  }
   return bestMatch;
}

function normalizePath(path) {
  return path
    .replace(/^\/api/, "")
    .replace(/\/$/, "")
    .toLowerCase();
}