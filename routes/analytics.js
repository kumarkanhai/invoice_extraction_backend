const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find();
        
        const totalInvoices = invoices.length;
        
        const spendByVendor = invoices.reduce((acc, inv) => {
            acc[inv.vendorName] = (acc[inv.vendorName] || 0) + inv.totalAmount;
            return acc;
        }, {});

        const monthlySpend = invoices.reduce((acc, inv) => {
            if (inv.date) {
                const month = inv.date.toISOString().slice(0, 7); // YYYY-MM
                acc[month] = (acc[month] || 0) + inv.totalAmount;
            }
            return acc;
        }, {});

        const currencyTotals = invoices.reduce((acc, inv) => {
            acc[inv.currency] = (acc[inv.currency] || 0) + inv.totalAmount;
            return acc;
        }, {});

        res.json({
            totalInvoices,
            spendByVendor: Object.entries(spendByVendor).map(([name, value]) => ({ name, value })),
            monthlySpend: Object.entries(monthlySpend).map(([name, value]) => ({ name, value })),
            currencyTotals,
            recentInvoices: invoices.slice(-5).reverse()
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
