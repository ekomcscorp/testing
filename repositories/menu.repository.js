const { Op } = require("sequelize");
const { sequelize, Menu, Akses } = require("../models");
const aksesRepository = require("./akses.repository");

class MenuRepository {
  findAll() {
    return Menu.findAll({
      raw: true,
      attributes: ["id_menu", "nama_menu", "icon", "link", "urutan", "is_active", "parent_id"],
      order: [["urutan", "ASC"]],
    });
  }

  findSubmenu() {
    return Menu.findAll({
      where: { parent_id: { [Op.ne]: null } },
      include: [{ model: Menu, as: "parent" }],
      order: [["urutan", "ASC"]],
    });
  }

  findById(id_menu) {
    return Menu.findByPk(id_menu);
  }

  findNested() {
    return Menu.findAll({
      where: { parent_id: null },
      include: [
        {
          model: Menu,
          as: "children",
          include: [
            {
              model: Menu,
              as: "children",
              include: [{ model: Menu, as: "children" }],
            },
          ],
        },
      ],
      order: [["urutan", "ASC"]],
    });
  }

  findParents() {
    return Menu.findAll({
      where: { parent_id: null },
      include: [{ model: Akses, as: "akses", required: false }],
      order: [["urutan", "ASC"]],
    });
  }

  getPaginated({ start = 0, length = 10, search = "", order, columns, filter = {} }) {
    try {
      const where = {};

      if (filter.parent_id === null) where.parent_id = null;
      if (filter.parent_not_null)   where.parent_id = { [Op.ne]: null };

      if (search) {
        where[Op.or] = [
          { nama_menu: { [Op.like]: `%${search}%` } },
          { link:      { [Op.like]: `%${search}%` } },
          { icon:      { [Op.like]: `%${search}%` } },
        ];
      }

      // Validasi order parameter
      let sort = [["urutan", "ASC"]];
      if (order?.length > 0 && columns?.[order[0].column]) {
        const columnData = columns[order[0].column]?.data;
        if (columnData) {
          sort = [[columnData, order[0].dir || "ASC"]];
        }
      }

      console.log("MenuRepository.getPaginated:", {
        start,
        length,
        search,
        filterKeys: Object.keys(filter),
        sortBy: sort[0],
        columnsLength: columns?.length || 0
      });

      return Menu.findAndCountAll({
        where,
        order: sort,
        offset: parseInt(start) || 0,
        limit: Math.min(parseInt(length) || 10, 50),
        raw: true,
      });
    } catch (error) {
      console.error("MenuRepository.getPaginated ERROR:", error.message);
      throw error;
    }
  }

  create(data) {
    return Menu.create(data);
  }

  async update(id_menu, data) {
    await Menu.update(data, { where: { id_menu } });
    return Menu.findByPk(id_menu);
  }

  async destroy(id_menu) {
    const transaction = await sequelize.transaction();
    try {
      await aksesRepository.deleteAksesById_menu(id_menu, transaction);
      await Menu.destroy({ where: { parent_id: id_menu }, transaction });
      await Menu.destroy({ where: { id_menu }, transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new MenuRepository();