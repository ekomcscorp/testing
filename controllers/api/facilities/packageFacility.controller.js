const response = require("../../../utils/response");
const packageFacilityService = require("../../../services/facilities/packageFacility.service");

class PackageFacilityController {
  async getAllPackageFacilities(req, res) {
    try {
      const packageFacilities = await packageFacilityService.getAllPackageFacilities();
      return response.success(res, "All package facilities fetched", packageFacilities);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async getPackageFacilityById(req, res) {
    try {
      const packageFacility = await packageFacilityService.getPackageFacilityById(req.params.id);
      return response.success(res, "Package facility fetched", packageFacility);
    } catch (error) {
      return response.notFound(res, error.message);
    }
  }

  async createPackageFacility(req, res) {
    try {
      const packageFacility = await packageFacilityService.createPackageFacility(req.body);
      return response.success(res, "Package facility created successfully", packageFacility);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async updatePackageFacility(req, res) {
    try {
      const updatedPackageFacility = await packageFacilityService.updatePackageFacility(req.params.id, req.body);
      return response.success(res, "Package facility updated successfully", updatedPackageFacility);
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async deletePackageFacility(req, res) {
    try {
      const result = await packageFacilityService.deletePackageFacility(req.params.id);
      return response.success(res, "Package facility deleted successfully", result);
    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new PackageFacilityController();