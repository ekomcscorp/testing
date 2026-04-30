const {Model, where} = require("sequelize");
const { Profile } = require("../models")

class ProfileRepository{
    async getProfile(userId) {
        return await Profile.findAll({
            where: { id_user: userId },
            include: [{
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'fullname', 'email']
            }]
          }
        )
    }

    async getProfileById(id) {
        return await Profile.findByPk(id, {
            include: [{
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'fullname', 'email']
            }]
        })
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