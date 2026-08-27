const fs = require("fs");
const path = require("path");
const response = require("../../utils/response");
const profileRepo = require("../../repositories/profile.repository");

class ProfileController {

  async getMyProfile(req, res) {
    try {

      const userId = req.user.id;

      const profile = await profileRepo.getProfileByUserId(userId);

      if (!profile) {
        return response.error(res, "Profile tidak ditemukan", 404);
      }

      return response.success(
        res,
        "Profile berhasil diambil",
        profile
      );

    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async createProfile(req, res) {
  try {

    const userId = req.user.id;

    const existingProfile =
      await profileRepo.getProfileByUserId(userId);

    if (existingProfile) {
      return response.error(
        res,
        "User sudah memiliki profile"
      );
    }

    const {
      address,
      jk,
      no_nik,
      no_paspor,
      nama_paspor,
      tgl_lahir
    } = req.body;

    const file_image = req.file?.filename || null;

    const payload = {
      user_id: userId,
      image: file_image,
      address,
      jk,
      no_nik,
      no_paspor,
      nama_paspor,
      tgl_lahir,
      rekening_mode: 'MARKETPLACE' // Default saat profile pertama kali dibuat
    };

    const profile =
      await profileRepo.createProfile(payload);

    return response.success(
      res,
      "Profile berhasil dibuat",
      profile,
      201
    );

  } catch (error) {

    console.error(error);

    return response.error(
      res,
      error.message
    );
  }
}

  async updateProfile(req, res) {
    try {

      const userId = req.user.id;

      const profile =
        await profileRepo.getProfileByUserId(userId);

      if (!profile) {
        return response.error(
          res,
          "Profile tidak ditemukan",
          404
        );
      }


      const {
        image,
        address,
        jk,
        no_nik,
        no_paspor,
        nama_paspor,
        tgl_lahir,
        fullname,
        email,
        username,
        no_wa
        // Catatan: rekening_mode TIDAK diupdate di sini.
        // Gunakan endpoint PUT /api/travel/rekening/mode
        // agar business rules validasi MANDIRI tetap dijalankan.
      } = req.body;

      const updateData = {};

      if (req.file) {
        updateData.image = req.file.filename;

        if (profile.image) {
          const oldPath = path.join(__dirname, "../../public/assets/img/profiles", profile.image);

          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (err) {
              console.error("Gagal menghapus foto lama:", err);
            }
          }
        }
      };
      if (address !== undefined) updateData.address = address;
      if (jk !== undefined) updateData.jk = jk;
      if (no_nik !== undefined) updateData.no_nik = no_nik;
      if (no_paspor !== undefined) updateData.no_paspor = no_paspor;
      if (nama_paspor !== undefined) updateData.nama_paspor = nama_paspor;
      if (tgl_lahir !== undefined) updateData.tgl_lahir = tgl_lahir;

      const updateUserData = {};

      if(fullname !== undefined ) updateUserData.fullname = fullname;
      if(email !== undefined ) updateUserData.email = email;
      if(username !== undefined ) updateUserData.username = username;
      if(no_wa !== undefined ) updateUserData.no_wa = no_wa;


      if (Object.keys(updateData).length > 0) {
        await profileRepo.updateProfile(
          profile.id,
          updateData
      );
    }

      if (Object.keys(updateUserData).length > 0) {
        await profileRepo.updateUser(
          userId,
          updateUserData
        );
      }

      await profileRepo.updateProfile(
        profile.id,
        updateData
      );

      const updatedProfile =
        await profileRepo.getProfileByUserId(userId);

      return response.success(
        res,
        "Profile berhasil diupdate",
        updatedProfile
      );
    } catch (error) {
      return response.error(res, error.message);
    }
  }

  async deleteProfile(req, res) {
    try {

      const userId = req.user.id;

      const profile =
        await profileRepo.getProfileByUserId(userId);

      if (!profile) {
        return response.error(
          res,
          "Profile tidak ditemukan",
          404
        );
      }

      await profileRepo.deleteProfile(profile.id);

      return response.success(
        res,
        "Profile berhasil dihapus"
      );

    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new ProfileController();