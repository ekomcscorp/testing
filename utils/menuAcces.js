module.exports.mapMenuWithAcces = (menu, akses) => ({
    id_menu: menu.id_menu,
    nama_menu: menu.nama_menu,
    link: menu.link,
    icon: menu.icon,
    parent_id: menu.parent_id,
    urutan: menu.urutan,
    is_active: menu.is_active,

    akses: {
        view_level: akses ? akses.view_level : 'N',
        create_level: akses ? akses.create_level : 'N',
        edit_level: akses ? akses.edit_level : 'N',
        delete_level: akses ? akses.delete_level : 'N',
        print_level: akses ? akses.print_level : 'N',
        upload_level: akses ? akses.upload_level : 'N',
    }
})