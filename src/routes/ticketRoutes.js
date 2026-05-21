const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Route mapping
router.post('/book-pass', ticketController.bookPass);
router.post('/verify-pass', ticketController.verifyPass);
router.post('/update-status', ticketController.updateRouteStatus);

module.exports = router;
