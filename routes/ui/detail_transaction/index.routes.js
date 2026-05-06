const { ReadableStream } = require("stream/web");

if (!global.ReadableStream) {
    global.ReadableStream = ReadableStream;
}

const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const Transaction = require("../../../repositories/transactions/transaction.repository");
const transactionController = require("../../../controllers/api/transactions/transaction.controller");
const { formatTransaction } = require("../../../utils/transactionFormatter")

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

router.get("/:id/invoice/pdf", auth.ensureAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Ambil data
        let transaction = await Transaction.getTransactionById(id);
        transaction = await formatTransaction(transaction);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
        }

        // 2. Render EJS → HTML string
        const filePath = path.join(
            __dirname,
            "../../../views/transactions/invoice.ejs"
        );

      

        const html = await ejs.renderFile(filePath, {
            data: transaction
        });

        // 3. Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: "new", // biar lebih stabil
        });

        const page = await browser.newPage();

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        // 4. Inject HTML
        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

          await page.addStyleTag({
            path: path.join(__dirname, "../../../public/stylesheets/output.css")
        })

        await page.emulateMediaType("screen");

        // 5. Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "15mm",
                bottom: "20mm",
                left: "15mm"
            }
        });

        await browser.close();

        // 6. Auto download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=invoice-${transaction.transaction_no}.pdf`
        );

        res.send(pdfBuffer);

    } catch (error) {
        console.error("❌ PDF ERROR:", error);
        res.status(500).send("Gagal generate PDF");
    }
});

router.get("/:id", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try {
        const { id } = req.params;
        let transaction = await Transaction.getTransactionById(id);
        transaction =  await formatTransaction(transaction);

        if (!transaction) {
            return res.status(404).send("Transaksi tidak ditemukan");
        }

        // Parse JSON snapshots jika masih string
        // if (transaction.details && transaction.details.length > 0) {
        //     transaction.details.forEach(detail => {
        //         if (typeof detail.flights_snapshot === 'string') {
        //             detail.flights_snapshot = JSON.parse(detail.flights_snapshot);
        //         }
        //         if (typeof detail.hotels_snapshot === 'string') {
        //             detail.hotels_snapshot = JSON.parse(detail.hotels_snapshot);
        //         }
        //         if (typeof detail.travel_snapshot === 'string') {
        //             detail.travel_snapshot = JSON.parse(detail.travel_snapshot);
        //         }
        //     });
        // }

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

router.get("/:id/invoice", auth.ensureAuth, async (req, res) => {
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