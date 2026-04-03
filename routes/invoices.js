const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

module.exports = router;
