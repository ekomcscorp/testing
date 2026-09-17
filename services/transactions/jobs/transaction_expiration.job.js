const cron = require('node-cron');

const transactionService = require(
    '../transaction.service'
);

const startTransactionExpirationJob = () => {
    // Jalan setiap 1 menit
    cron.schedule('* * * * *', async () => {
        try {
            await transactionService.expireOverdueTransactions();
        } catch (error) {
            console.error(
                '[TRANSACTION EXPIRATION JOB]',
                error.message
            );
        }
    });

    console.log(
        '[CRON] Transaction expiration job started.'
    );
};

module.exports = startTransactionExpirationJob;