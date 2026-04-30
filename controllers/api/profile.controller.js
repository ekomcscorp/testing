const response = require("../../utils/response");
const profileRepo = require("../../repositories/profile.repository");

class ProfileController {
    async getMyProfile(req, res) {
        try {
            // Ambil profile dari user yang login
            if (!req.session || !req.session.user || !req.session.user.id) {
                return response.error(res, "Silakan login terlebih dahulu", 401);
            }

            const userId = req.session.user.id;
            const profiles = await profileRepo.getProfile(userId);

            if (!profiles || profiles.length === 0) {
                return response.error(res, "Profile tidak ditemukan", 404);
            }

            return response.success(res, "Profile berhasil diambil", profiles[0]);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async getProfileById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return response.error(res, "ID profile harus disediakan");
            }

            const profile = await profileRepo.getProfileById(id);

            if (!profile) {
                return response.error(res, "Profile tidak ditemukan", 404);
            }

            return response.success(res, "Profile berhasil diambil", profile);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    async createProfile(req, res) {
        try {
            // Validasi session user
            if (!req.session || !req.session.user || !req.session.user.id) {
                return response.error(res, "Silakan login terlebih dahulu", 401);
            }

            const userId = req.session.user.id;
            const { image, address, jk, no_nik, no_paspor, nama_paspor } = req.body;

            // Validasi data yang diperlukan
            if (!address) {
                return response.error(res, "Alamat wajib diisi");
            }

            // Cek apakah user sudah punya profile
            const existingProfile = await profileRepo.getProfile(userId);
            if (existingProfile && existingProfile.length > 0) {
                return response.error(res, "User sudah memiliki profile");
            }

            const profileData = {
                id_user: userId,
                image,
                address,
                jk,
                no_nik,
                no_paspor,
                nama_paspor
            };

            const profile = await profileRepo.createProfile(profileData);

            return response.success(res, "Profile berhasil dibuat", profile, 201);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0].path;
                return response.error(res, `${field} sudah digunakan`, 400);
            }
            return response.error(res, error.message);
        }
    }

    async updateProfile(req, res) {
        try {
            const { id } = req.params;
            const { image, address, jk, no_nik, no_paspor, nama_paspor } = req.body;

            if (!id) {
                return response.error(res, "ID profile harus disediakan");
            }

            // Cek apakah profile exist
            const profile = await profileRepo.getProfileById(id);
            if (!profile) {
                return response.error(res, "Profile tidak ditemukan", 404);
            }

            // Validasi ownership - hanya user sendiri yang bisa update profile-nya
            if (req.session && req.session.user && req.session.user.id !== profile.id_user) {
                return response.error(res, "Anda tidak memiliki akses untuk mengubah profile ini", 403);
            }

            const updateData = {};
            if (image !== undefined) updateData.image = image;
            if (address !== undefined) updateData.address = address;
            if (jk !== undefined) updateData.jk = jk;
            if (no_nik !== undefined) updateData.no_nik = no_nik;
            if (no_paspor !== undefined) updateData.no_paspor = no_paspor;
            if (nama_paspor !== undefined) updateData.nama_paspor = nama_paspor;

            if (Object.keys(updateData).length === 0) {
                return response.error(res, "Tidak ada data untuk diupdate");
            }

            await profileRepo.updateProfile(id, updateData);

            const updatedProfile = await profileRepo.getProfileById(id);

            return response.success(res, "Profile berhasil diupdate", updatedProfile);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = error.errors[0].path;
                return response.error(res, `${field} sudah digunakan`, 400);
            }
            return response.error(res, error.message);
        }
    }

    async deleteProfile(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return response.error(res, "ID profile harus disediakan");
            }

            // Cek apakah profile exist
            const profile = await profileRepo.getProfileById(id);
            if (!profile) {
                return response.error(res, "Profile tidak ditemukan", 404);
            }

            // Validasi ownership
            if (req.session && req.session.user && req.session.user.id !== profile.id_user) {
                return response.error(res, "Anda tidak memiliki akses untuk menghapus profile ini", 403);
            }

            await profileRepo.deleteProfile(id);

            return response.success(res, "Profile berhasil dihapus");
        } catch (error) {
            return response.error(res, error.message);
        }
    }
}

module.exports = new ProfileController();
