const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../middleware");
const Transaction = require("../../services/transactions/transaction.service");

router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try { 
        const transactions = await Transaction.getAllTransactions();

        res.render("home", {
            link: "transaction/transaction_list",
            jslink: "javascripts/transaction_javascript.js",
            user: req.session.user,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
            transactions
        });
    } catch (error) {
        console.error("❌ Error loading transactions:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;