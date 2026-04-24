const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const Transaction = require("../../../repositories/transactions/transaction.repository");
const transactionController = require("../../../controllers/api/transactions/transaction.controller");

// router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
//     try { 
//         const transactions = await Transaction.getAllTransactions();

//         res.render("home", {
//             link: "transactions/transaction_list",
//             jslink: "/javascripts/transaction_javascript.js",
//             user: req.session.user,
//             username: req.session.user?.username || "Guest",
//             fullname: req.session.user?.fullname || "Guest",
//             transactions
//         });
//     } catch (error) {
//         console.error("❌ Error loading transactions:", error.message);
//         res.status(500).send("Internal Server Error");
//     }
// });

router.get("/:id", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.getTransactionById(id);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
        }

        // Parse JSON snapshots jika masih string
        if (transaction.details && transaction.details.length > 0) {
            transaction.details.forEach(detail => {
                if (typeof detail.flights_snapshot === 'string') {
                    detail.flights_snapshot = JSON.parse(detail.flights_snapshot);
                }
                if (typeof detail.hotels_snapshot === 'string') {
                    detail.hotels_snapshot = JSON.parse(detail.hotels_snapshot);
                }
                if (typeof detail.travel_snapshot === 'string') {
                    detail.travel_snapshot = JSON.parse(detail.travel_snapshot);
                }
            });
        }

        const aksesMiddleware = res.locals.akses || {};
        const akses = {
            view: aksesMiddleware.view_level === 'Y',
            edit: aksesMiddleware.edit_level === 'Y',
            delete: aksesMiddleware.delete_level === 'Y'
        };

        res.render("home", {
            link: "transactions/detail_transaction",
            jslink: "/javascripts/detailTransaction_javascript.js",
            user: req.session.user,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
            data: transaction,
            akses
        });
    } catch (error) {
        console.error("❌ Error loading detail transaction:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;module.exports = router;