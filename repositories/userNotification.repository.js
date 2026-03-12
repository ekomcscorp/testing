const { UserNotification } = require("../models");

class UserNotificationRepository {
  async findByUserId(userId) {
    return await UserNotification.findOne({
      where: {
        userId: userId
      }
    });
  }

  async createNotification(data, transaction) {
    return await UserNotification.create(data, { transaction });
  }

  async getUnreadNotifications() {
    return await UserNotification.findAll();
  }

  async deleteNotification(userId) {
    return await UserNotification.destroy({ where: { userId: userId } });
  }
}

module.exports = new UserNotificationRepository();
