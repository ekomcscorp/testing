const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const response = require("../../utils/response");
const profileRepo = require("../../repositories/profile.repository");

// 💡 FIX 1: safeDeleteFile yang mendukung folderSubPath ("profiles") & external_assets
const safeDeleteFile = (folderSubPath = "", filename) => {
  if (!filename) return;

  try {
    const cleanFileName = path.basename(filename);

    const baseDir = process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), '../../../../external_assets')
      : path.resolve(process.cwd(), "public/assets/img/profiles");

    // Jika di production & pakai subfolder "profiles", susun path-nya: baseDir -> folderSubPath -> cleanFileName
    const absolutePath = process.env.NODE_ENV === 'production' && folderSubPath
      ? path.resolve(baseDir, folderSubPath, cleanFileName)
      : path.resolve(baseDir, cleanFileName);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`[FILE DELETED] ${absolutePath}`);
    } else {
      console.warn(`[FILE NOT FOUND] ${absolutePath}`);
    }
  } catch (e) {
    console.error(`[DELETE ERROR] ${filename}:`, e.message);
  }
};

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
        // Hapus file baru jika profile tidak ditemukan
        if (req.file) {
          safeDeleteFile("profiles", req.file.filename);
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

      // 💡 FIX 2: Gunakan safeDeleteFile untuk menghapus foto lama di external_assets
      if (req.file) {
        updateData.image = req.file.filename;

        if (profile.image) {
          safeDeleteFile("profiles", profile.image);
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
      // 💡 FIX 3: Clean up file baru jika terjadi crash DB
      if (req.file) {
        safeDeleteFile("profiles", req.file.filename);
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

      // 💡 FIX 4: Gunakan safeDeleteFile saat profile dihapus
      if (profile.image) {
        safeDeleteFile("profiles", profile.image);
      }

      await profileRepo.deleteProfile(profile.id);

      return response.success(res, "Profile berhasil dihapus");
    } catch (error) {
      return response.error(res, error.message);
    }
  }
}

module.exports = new ProfileController();