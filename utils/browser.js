// utils/browser.js

const puppeteer = require("puppeteer");

let browserInstance = null;

async function getBrowser() {
    browserInstance = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });

    return browserInstance;
}

module.exports = { getBrowser };