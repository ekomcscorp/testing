const { ReadableStream } = require("stream/web");

if (!global.ReadableStream) {
    global.ReadableStream = ReadableStream;
}

const express = require("express");
const router = express.Router();
const pdf = require("html-pdf");
const ejs = require("ejs");
const path = require("path");
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const Transaction = require("../../../repositories/transactions/transaction.repository");
const transactionController = require("../../../controllers/api/transactions/transaction.controller");
const { formatTransaction } = require("../../../utils/transactionFormatter");
const fs = require('fs');
const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public/assets/img/logo/pengenumroh.png"));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

router.get("/:id/invoice/pdf", auth.ensureAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let transaction = await Transaction.getTransactionById(id);
        transaction = await formatTransaction(transaction);

        // const cssPath = path.join(process.cwd, "public/stylesheets/output.css");
        // const cssContent = fs.readFileSync(cssPath, "utf-8");
        const filePath = path.join(__dirname, "../../../views/transactions/invoice.ejs");
        const html = await ejs.renderFile(filePath, {
            data: transaction,
            logoPath: logoBase64,
            // tailwindCSS: cssContent
        });

        const config = { 
            format: 'A4', 
            printBackground: true,
            margin: {
                top: "15mm",
                right: "15mm",
                bottom: "15mm",
                left: "15mm"
            }
        };

        pdf.create(html, config).toBuffer((err, buffer) => {
            if (err) return res.status(500).send(err);
            
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice-${transaction.transaction_no}.pdf`);
            res.send(buffer);
        });

    } catch (error) {
        res.status(500).send("Gagal generate PDF");
    }
});

router.get("/:id", auth.ensureAuth,  loadSidebar, loadNotification, async (req, res) => {
    try {
        const { id } = req.params;
        let transaction = await Transaction.getTransactionById(id);
        transaction = await formatTransaction(transaction);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
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
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            data: transaction,
            akses
        });
    } catch (error) {
        console.error("❌ Error loading detail transaction:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/:id/invoice", auth.ensureAuth, auth.restrictToAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        let transaction = await Transaction.getTransactionById(id);
        transaction = await formatTransaction(transaction);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
        }

        res.render("transactions/invoice", {
            data: transaction
        });

    } catch (error) {
        console.error("❌ Error loading invoice:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
