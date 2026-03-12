const { Model, Op } = require("sequelize");
const { User, Userlevel, UserNotification } = require("../models");

class UserRepository {
  async getAllUsers() {
    return await User.findAll();
  }

  async getAllUserNotifications() {
    return await User.findAll({
      where: {
        [Op.or]: [
          { is_active: 'N' },
          { id_level: 1 }
        ]
      }
    });
  }

  async getPaginatedUsers({ start, length, search, order, columns }) {
    const where = {
      ...(search && {
        [Op.or]: [
          { fullname: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
          { id_level: { [Op.like]: `%${search}%` } },
          { is_active: { [Op.like]: `%${search}%` } }
        ],
      }),
      // Add any other filters you need here
    };

    const sort =
      order && order.length > 0
        ? [[columns[order[0].column].data, order[0].dir]]
        : [["created_at", "DESC"]];

    const offset = start || 0; // Default to 0 if start is not provided
    const limit = length || 10; // Default to 10 if length is not provided

    const result = await User.findAndCountAll({
      where,
      order: sort,
      offset,
      limit,
      include: [
        {
          model: Userlevel,
          as: 'level',
          attributes: ['nama_level'], // atau atribut lain yang kamu butuh
        }
      ]
    });

    return result;
  }

  async getUserById(id) {
    return await User.findByPk(id);
  }

  async getUserByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  async createUser(userData) {
    return await User.create(userData);
  }

  async registerUser(data, transaction) {
    return await User.create(data, { transaction });
  }


  async updateUser(id, userData) {
    return await User.update(userData, { where: { id } });
  }

  async deleteUser(id) {
    return await User.destroy({ where: { id } });
  }
}

module.exports = new UserRepository();
