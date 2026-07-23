const response = require("../../../utils/response");
const transactionJamaahService = require("../../../services/transactions/transaction_jamaah.service");

function mapUploadedFiles(files = {}) {
    const uploadedFiles = {};

    const fileFields = [
        "img_ktp",
        "img_kk",
        "img_passpor",
        "img_diri",
        "img_akta_kelahiran"
    ];

    fileFields.forEach(field => {
        if (files[field]?.length > 0) {
            uploadedFiles[field] = files[field][0].filename;
        }
    });

    return uploadedFiles;
}

class TransactionJamaahController {
    /**
     * Get semua jamaah dengan datatable pagination
     * GET /api/transactions/jamaah/datatables
     */
    async getAllJamaahDatatables(req, res) {
        try {
            const { akses } = res.locals;

            // Check user access
            if (!akses || akses.view_level?.trim() !== "Y") {
                return response.error(res, "Akses ditolak", 403);
            }

            const result = await transactionJamaahService.getAllJamaahDatatables(req.query);

            // Map akses ke dalam data
            const data = result.data.map((row) => ({
                ...transactionJamaahService.formatJamaahResponse(row)[0],
                akses: {
                    view: akses.view_level === "Y",
                    edit: akses.edit_level === "Y",
                    delete: akses.delete_level === "Y"
                }
            }));

            return res.status(200).json({
                success: true,
                message: "Jamaah berhasil diambil",
                draw: result.draw,
                recordsTotal: result.recordsTotal,
                recordsFiltered: result.recordsFiltered,
                data
            });
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    /**
     * Get semua jamaah (simple list)
     * GET /api/transactions/jamaah
     */
    async getAllJamaah(req, res) {
        try {
            const { transactionId, gender, status, filter } = req.query;

            let data;

            // Filter berdasarkan transactionId jika ada parameter
            if (transactionId) {
                data = await transactionJamaahService.getJamaahByTransactionId(transactionId);
            }
            // Filter berdasarkan custom filter (gender, status, date range)
            else if (filter) {
                try {
                    const filterObj = JSON.parse(filter);
                    data = await transactionJamaahService.getJamaahWithFilters(filterObj);
                } catch (e) {
                    return response.error(res, "Format filter tidak valid (harus JSON)", 400);
                }
            }
            // Default: ambil semua
            else {
                const result = await transactionJamaahService.getAllJamaahDatatables({
                    draw: 1,
                    start: 0,
                    length: 1000 // Default limit
                });
                data = result.data;
            }

            const formatted = transactionJamaahService.formatJamaahResponse(data);
            return response.success(res, "Data jamaah berhasil diambil", formatted);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    /**
     * Get jamaah berdasarkan ID
     * GET /api/transactions/jamaah/:id
     */
    async getJamaahById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return response.error(res, "ID jamaah tidak valid", 400);
            }

            const jamaah = await transactionJamaahService.getJamaahById(parseInt(id));
            const formatted = transactionJamaahService.formatJamaahResponse(jamaah);

            return response.success(res, "Data jamaah berhasil diambil", formatted[0]);
        } catch (error) {
            if (error.message.includes("tidak ditemukan")) {
                return response.error(res, error.message, 404);
            }
            return response.error(res, error.message);
        }
    }

    /**
     * Get jamaah by Transaction ID
     * GET /api/transactions/:transactionId/jamaah
     */
    async getJamaahByTransaction(req, res) {
        try {
            const { transactionId } = req.params;

            if (!transactionId || isNaN(transactionId)) {
                return response.error(res, "ID transaksi tidak valid", 400);
            }

            const jamaahList = await transactionJamaahService.getJamaahByTransactionId(parseInt(transactionId));
            const formatted = transactionJamaahService.formatJamaahResponse(jamaahList);

            return response.success(
                res,
                `Ditemukan ${formatted.length} jamaah untuk transaksi ini`,
                formatted
            );
        } catch (error) {
            if (error.message.includes("tidak ditemukan")) {
                return response.error(res, error.message, 404);
            }
            return response.error(res, error.message);
        }
    }

    /**
     * Create jamaah baru
     * POST /api/transactions/jamaah
     * @body {Object} jamaahData
     */
    async createJamaah(req, res) {
        try {
            const jamaahData = {
                ...req.body,
                ...mapUploadedFiles(req.files)
            };

            if (!jamaahData || Object.keys(jamaahData).length === 0) {
                return response.error(res, "Data jamaah tidak boleh kosong", 400);
            }

            const result = await transactionJamaahService.createJamaah(jamaahData);
            const formatted = transactionJamaahService.formatJamaahResponse(result);

            return response.success(res, "Jamaah berhasil dibuat", formatted[0], 201);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * Create multiple jamaah (bulk)
     * POST /api/transactions/jamaah/bulk
     * @body {Array} jamaahDataArray
     */
    async createBulkJamaah(req, res) {
        try {
            const { jamaahList } = req.body;

            if (!jamaahList || !Array.isArray(jamaahList) || jamaahList.length === 0) {
                return response.error(res, "Data jamaah harus berupa array dan tidak boleh kosong", 400);
            }

            const result = await transactionJamaahService.createBulkJamaah(jamaahList);
            const formatted = transactionJamaahService.formatJamaahResponse(result);

            return response.success(
                res,
                `${result.length} jamaah berhasil dibuat`,
                formatted,
                201
            );
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * Update jamaah
     * PUT /api/transactions/jamaah/:id
     * @body {Object} updateData
     */
    async updateJamaah(req, res) {

        try {

            const { id } = req.params;

            if (!id || isNaN(id)) {
                return response.error(
                    res,
                    "ID jamaah tidak valid",
                    400
                );
            }

            const updateData = {
                ...req.body,
                ...mapUploadedFiles(req.files)
            };

            if (Object.keys(updateData).length === 0) {
                return response.error(
                    res,
                    "Data update tidak boleh kosong",
                    400
                );
            }

            const result =
                await transactionJamaahService.updateJamaah(
                    Number(id),
                    updateData
                );

            return response.success(
                res,
                "Jamaah berhasil diupdate",
                transactionJamaahService
                    .formatJamaahResponse(result)[0]
            );

        } catch (err) {

            if (err.message.includes("tidak ditemukan")) {
                return response.error(res, err.message, 404);
            }

            return response.error(res, err.message, 400);

        }

    }

    /**
     * Delete jamaah
     * DELETE /api/transactions/jamaah/:id
     */
    async deleteJamaah(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return response.error(res, "ID jamaah tidak valid", 400);
            }

            const deleted = await transactionJamaahService.deleteJamaah(parseInt(id));

            return response.success(res, "Jamaah berhasil dihapus", { deleted });
        } catch (error) {
            if (error.message.includes("tidak ditemukan")) {
                return response.error(res, error.message, 404);
            }
            return response.error(res, error.message);
        }
    }

    /**
     * Search jamaah berdasarkan nama
     * GET /api/transactions/jamaah/search/name?q=nama
     */
    async searchByName(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return response.error(res, "Query pencarian tidak boleh kosong", 400);
            }

            const result = await transactionJamaahService.searchJamaahByName(q);
            const formatted = transactionJamaahService.formatJamaahResponse(result);

            return response.success(res, `Ditemukan ${result.length} jamaah`, formatted);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    /**
     * Search jamaah berdasarkan email
     * GET /api/transactions/jamaah/search/email?q=email
     */
    async searchByEmail(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return response.error(res, "Query pencarian tidak boleh kosong", 400);
            }

            const result = await transactionJamaahService.searchJamaahByEmail(q);
            const formatted = transactionJamaahService.formatJamaahResponse(result);

            return response.success(res, `Ditemukan ${result.length} jamaah`, formatted);
        } catch (error) {
            return response.error(res, error.message);
        }
    }

    /**
     * Get jamaah berdasarkan custom filter
     * GET /api/transactions/jamaah/filter?gender=L&status=menikah&transactionStatus=SUCCESS
     */
    async getWithFilter(req, res) {
        try {
            const { gender, status, transactionStatus, createdAt_from, createdAt_to } = req.query;

            const filters = {};
            if (gender) filters.gender = gender;
            if (status) filters.status = status;
            if (transactionStatus) filters.transactionStatus = transactionStatus;
            if (createdAt_from) filters.createdAt_from = createdAt_from;
            if (createdAt_to) filters.createdAt_to = createdAt_to;

            if (Object.keys(filters).length === 0) {
                return response.error(res, "Minimal satu filter harus diberikan", 400);
            }

            const result = await transactionJamaahService.getJamaahWithFilters(filters);
            const formatted = transactionJamaahService.formatJamaahResponse(result);

            return response.success(res, `Ditemukan ${result.length} jamaah`, formatted);
        } catch (error) {
            return response.error(res, error.message, 400);
        }
    }

    /**
     * Get statistik jamaah
     * GET /api/transactions/jamaah/statistics
     */
    async getStatistics(req, res) {
        try {
            const stats = await transactionJamaahService.getJamaahStatistics();
            return response.success(res, "Statistik jamaah berhasil diambil", stats);
        } catch (error) {
            return response.error(res, error.message);
        }
    }
}

module.exports = new TransactionJamaahController();
