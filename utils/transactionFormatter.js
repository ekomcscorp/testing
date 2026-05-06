async function formatTransaction(transaction) {
    if (!transaction) return null;

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

    return transaction;
}

module.exports = { formatTransaction };