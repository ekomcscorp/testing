const fs = require("fs").promises; // Menggunakan fs.promises untuk async I/O
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
      const existingProfile = await profileRepo.getProfileByUserId(userId);

      if (existingProfile) {
        return response.error(
          res,
          "User sudah memiliki profile",
          400
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
        rekening_mode: 'MARKETPLACE'
      };

      const profile = await profileRepo.createProfile(payload);

      return response.success(
        res,
        "Profile berhasil dibuat",
        profile,
        201
      );
    } catch (error) {
      console.error(error);
      return response.error(res, error.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await profileRepo.getProfileByUserId(userId);

      if (!profile) {
        // Hapus file baru yang sempat diupload middleware jika profile tidak ditemukan
        if (req.file) {
          const uploadedPath = path.resolve(__dirname, "../../public/assets/img/profiles", req.file.filename);
          await fs.unlink(uploadedPath).catch(() => {});
        }
        return response.error(res, "Profile tidak ditemukan", 404);
      }

      const {
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
      } = req.body;

      const updateData = {};

      // Handle upload foto baru & hapus foto lama
      if (req.file) {
        updateData.image = req.file.filename;

        if (profile.image) {
          // path.resolve memastikan absolute path yang presisi dari root direktori file ini
          const oldPath = path.resolve(__dirname, "../../public/assets/img/profiles", profile.image);

          try {
            await fs.access(oldPath); // Cek keberadaan file (async)
            await fs.unlink(oldPath);  // Hapus file lama (async)
          } catch (err) {
            console.error("File lama tidak ditemukan atau gagal dihapus:", err.message);
          }
        }
      }

      if (address !== undefined) updateData.address = address;
      if (jk !== undefined) updateData.jk = jk;
      if (no_nik !== undefined) updateData.no_nik = no_nik;
      if (no_paspor !== undefined) updateData.no_paspor = no_paspor;
      if (nama_paspor !== undefined) updateData.nama_paspor = nama_paspor;
      if (tgl_lahir !== undefined) updateData.tgl_lahir = tgl_lahir;

      const updateUserData = {};
      if (fullname !== undefined) updateUserData.fullname = fullname;
      if (email !== undefined) updateUserData.email = email;
      if (username !== undefined) updateUserData.username = username;
      if (no_wa !== undefined) updateUserData.no_wa = no_wa;

      // Eksekusi update database HANYA jika ada data yang diubah
      if (Object.keys(updateData).length > 0) {
        await profileRepo.updateProfile(profile.id, updateData);
      }

      if (Object.keys(updateUserData).length > 0) {
        await profileRepo.updateUser(userId, updateUserData);
      }

      const updatedProfile = await profileRepo.getProfileByUserId(userId);

      return response.success(
        res,
        "Profile berhasil diupdate",
        updatedProfile
      );
    } catch (error) {
      // Clean up file baru jika terjadi crash saat query DB
      if (req.file) {
        const uploadedPath = path.resolve(__dirname, "../../public/assets/img/profiles", req.file.filename);
        await fs.unlink(uploadedPath).catch(() => {});
      }
      return response.error(res, error.message);
    }
  }

  async deleteProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await profileRepo.getProfileByUserId(userId);

      if (!profile) {
        return response.error(res, "Profile tidak ditemukan", 404);
      }

      // Hapus file gambar jika profile dihapus
      if (profile.image) {
        const imagePath = path.resolve(__dirname, "../../public/assets/img/profiles", profile.image);
        await fs.unlink(imagePath).catch((err) => console.error("Gagal menghapus gambar saat delete profile:", err.message));
      }

      await profileRepo.deleteProfile(profile.id);

      return response.success(res, "Profile berhasil dihapus");
    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new ProfileController();