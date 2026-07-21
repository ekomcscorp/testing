const express = require("express");
const router = express.Router();
const { auth, loadSidebar} = require("../../../middleware");
const JamaahController = require("../../../repositories/transactions/transaction_jamaah.repository")

router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar, async (req, res) => {
    try {
        const jamaah = await JamaahController.getAllJamaah();
        res.render("home", {
            link: "transactions/jamaah_list",
            jslink: "javascripts/jamaah_javascript.js",
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            jamaah
        })
    } catch (error) {
        console.error("❌ Error loading jamaah:", error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;