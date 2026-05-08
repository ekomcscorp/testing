const {Model, where} = require("sequelize");
const { Profile, User } = require("../models")

class ProfileRepository{
    async getProfile() {
       return await User.findAll({
      include: [
        {
          model: Profile,
          as: "profile",
          attributes: ["image", "address", "jk", "no_nik", "no_paspor", "nama_paspor", "tgl_lahir"]
        }
      ]
    });
    }

    async getProfileById(id) {
        return await User.findByPk(id, {
      include: [
        {
          model: Profile,
          as: "profile",
          attributes: ["image", "address", "tgl_lahir","jk", "no_nik", "no_paspor", "nama_paspor"]
        }
      ]
    });
    }

    async createProfile(profileData) {
        return await Profile.create(profileData)
    }

    async updateProfile(profileId, profileData) {
        return await Profile.update(profileData, { where: { id: profileId }})
    }

    async deleteProfile(profileId) {
        return await Profile.destroy({ where: { id: profileId }});
    }
}

module.exports = new ProfileRepository();