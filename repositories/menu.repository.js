const { Model, Op, where } = require("sequelize");
const { sequelize, Menu, Akses } = require("../models");
const aksesRepository = require("./akses.repository");

const { raw } = require("body-parser");

class MenuRepository {

  async getAllMenu() {
    return await Menu.findAll({ 
      raw: true,
      attributes: ['id_menu', 'nama_menu','icon','link','urutan','is_active','parent_id'],
      order: [['urutan', 'ASC']] 
    });
  }
  
  async getSubmenu() {
    return await Menu.findAll({    
      where: {
        parent_id: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: Menu,
          as: "parent"
        }
      ],
      order: [['urutan', 'ASC']]
    })
  }

  async getMenuById(id_menu) {
    return await Menu.findByPk(id_menu);
  }

  async getAllNestedMenu(){
    return await Menu.findAll({
      where: {parent_id: null},
      include:[ 
        {
          model: Menu,
          as: 'children',
          include: [
            {
              model: Menu,
              as: 'children',
              include: [
                {
                  model: Menu,
                  as: 'children'
                }
              ]
            }
          ]
        }
      ],
      order: [['urutan', 'ASC']]
    })
  }

  async getParentMenus() {
  return await Menu.findAll({
      where: {parent_id: null},
      include: [{
        model: Akses,
        as: 'akses',
        required: false
      }],
      order: [['urutan', 'ASC']],
    })
  }



  async getPaginatedMenu({ start, length, search, order, columns, filter={}}) {
    const where = { }; // Add any other filters you need here

    if( filter.parent_id === null){
      where.parent_id = null;
    }

    if(filter.parent_not_null){
      where.parent_id = {[Op.ne]: null};
    }

    if(search){
      where[Op.or] = [
        { id_menu: { [Op.like]: `%${search}%` } },
        { parent_id: { [Op.like]: `%${search}%` } },
        { nama_menu: { [Op.like]: `%${search}%` } },
        { link: { [Op.like]: `%${search}%` } },
        { icon: { [Op.like]: `%${search}%` } },
        { urutan: { [Op.like]: `%${search}%` } },
        { is_active: { [Op.like]: `%${search}%` } }
      ]
    }
    const sort =
      order && order.length > 0
        ? [[columns[order[0].column].data, order[0].dir]]
        : [["urutan", "ASC"]];

    const offset = start || 0; // Default to 0 if start is not provided
    const limit = length || 10; // Default to 10 if length is not provided

    const result = await Menu.findAndCountAll({
      where,
      order: sort,
      offset,
      limit,
    });

    return result;
  }
  

  async createMenu(menuData) {
    return await Menu.create(menuData);
  }

  async updateMenu(id_menu, menuData) {
    await Menu.update(menuData, { where: { id_menu } });
    return await Menu.findByPk(id_menu);
  }

  async deleteMenu(id_menu) {
    const transaction = await sequelize.transaction();

    try {
      // Hapus akses menu terlebih dahulu
      await aksesRepository.deleteAksesById_menu(id_menu, transaction);

      // hapus submenu
      await Menu.destroy({
        where: { parent_id: id_menu },
        transaction
      });

      // Hapus menu
      await Menu.destroy({ where: { id_menu }, transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getNestedMenu() {
    const allMenu = await Menu.findAll({
      raw: true,
      order: [['urutan', 'ASC']]
    });

    const menuMap = {};
    const nestedMenu = [];

    allMenu.forEach(menu => {
      menu.children = [];
      menuMap[menu.id_menu] = menu;
    })

    allMenu.forEach(menu => {
      if(menu.parent_id){
        if(menuMap[menu.parent_id]){   
          menuMap[menu.parent_id].children.push(menu);
        }
        } else {
          nestedMenu.push(menu);
        }
    })

    return nestedMenu;
  }
  
}

module.exports = new MenuRepository();