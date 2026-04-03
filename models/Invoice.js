const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    vendorName: { type: String, required: true },
    vendorAddress: { type: String },
    invoiceNumber: { type: String },
    date: { type: Date },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    lineItems: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    fileUrl: { type: String, required: true },
    rawText: { type: String },
    confidenceScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
