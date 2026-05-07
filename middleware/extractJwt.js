const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
    let token = null;

    // 1. Cek dari Header HTTP (Paling utama untuk API)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } 
    // 2. Cek dari Cookie (Untuk Page EJS Load biasa yang tidak membawa Bearer header)
    else if (req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]*)/);
        if (match) {
            token = match[1];
        }
    }

    // Jika token ditemukan, ekstrak dan pasang ke req.user
    if (token) {
        try {
            req.user = verifyToken(token);
        } catch (err) {
            // Token expired atau gak valid, biarkan req.user kosong
            req.user = null;
        }
    }

    next();
};
