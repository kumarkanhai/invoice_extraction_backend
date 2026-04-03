const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Invoice = require('../models/Invoice');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const imagePart = fileToGenerativePart(filePath, mimeType);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
        You are an expert OCR and Invoice Parsing AI. Extract the details from the provided invoice image.
        Format the output strictly as a JSON object with the following keys, and no markdown formatting or backticks:
        - vendorName: (string) the name of the company or person issuing the invoice. Required.
        - vendorAddress: (string) address (if available)
        - invoiceNumber: (string) invoice identifier
        - date: (string) Format: YYYY-MM-DD
        - totalAmount: (number) total amount including taxes. Required.
        - currency: (string) e.g., "USD", "EUR"
        - lineItems: (array of objects) where each object has:
            - description: (string) 
            - quantity: (number)
            - unitPrice: (number)
            - total: (number)
        - confidenceScore: (number) between 0.0 and 1.0, estimating your overall confidence in this extraction
        
        If a field is missing, set string fields to null and number fields to 0. Return ONLY the raw JSON, do not include \`\`\`json or \`\`\` tags around it.`;

        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text();
        
        // Clean up markdown in case the model returns it anyway
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const extractedData = JSON.parse(responseText);

        const newInvoice = new Invoice({
            vendorName: extractedData.vendorName || 'Unknown Vendor',
            vendorAddress: extractedData.vendorAddress,
            invoiceNumber: extractedData.invoiceNumber,
            date: extractedData.date ? new Date(extractedData.date) : new Date(),
            totalAmount: extractedData.totalAmount || 0,
            currency: extractedData.currency || 'USD',
            lineItems: extractedData.lineItems || [],
            confidenceScore: extractedData.confidenceScore || 1.0,
            fileUrl: `/uploads/${req.file.filename}`,
            rawText: responseText // To store what the model outputted
        });

        await newInvoice.save();

        res.json({ message: 'Success', data: newInvoice });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process invoice', details: error.message });
    }
});

module.exports = router;
