module.exports = function appSignatureGuard(req, res, next) {

    const appSignature = req.headers['x-app-signature'];

    if(req.user){
        return next();
    }

    const validSignature = process.env.APP_SIGNATURE;

    if(appSignature  && appSignature === validSignature){
        return next();
    }

    return res.status(401).json({
        status: 401,
        message: "Access Denied: Because You are not invited."
    });

}