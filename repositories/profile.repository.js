const {Model, where} = require("sequelize");
const { Profile, User } = require("../models")

class ProfileRepository{
   async getProfileByUserId(userId) {
    return await Profile.findOne({
      where: {
        user_id: userId
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "username",
            "fullname",
            "email"
          ]
        }
      ]
    });
  }

    async createProfile(payload) {
        return await Profile.create(payload)
    }

    async updateProfile(profileId, payload) {
        return await Profile.update(payload, { 
          where: { id: profileId }
        })
    }

    async updateUser(userId, payload) {
      return await User.update(payload, {
        where: { id: userId }
      })
    }

    async deleteProfile(profileId) {
        return await Profile.destroy({ where: { id: profileId }});
    }
}

module.exports = new ProfileRepository();