const express = require('express');
const router = express.Router();
const DashboardController = require('../../controllers/api/dashboard.controller');

router.get('/stats', DashboardController.getStats);

module.exports = router;
