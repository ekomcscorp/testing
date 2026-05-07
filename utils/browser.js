// utils/browser.js

const puppeteer = require("puppeteer");

let browserInstance = null;

async function getBrowser() {
    if (browserInstance) return browserInstance;

    browserInstance = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ]
    });

    return browserInstance;
}

module.exports = { getBrowser };