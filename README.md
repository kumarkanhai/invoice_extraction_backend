# Lumina - Invoice Extraction AI

An AI-powered web application that extracts structured data from uploaded invoice documents (images and PDFs) using Google's Gemini Vision LLM, stores the results in a MongoDB database (MERN Stack), and provides rich analytics visually on a beautifully designed dashboard.

## System Architecture

- **Frontend**: React (Vite) + Vanilla CSS (Custom design system). Features routing, state management, animated transitions using Framer Motion, and dynamic charts using Recharts.
- **Backend**: Node.js + Express + Multer for handling api routes and file uploads natively. 
- **Database**: MongoDB via Mongoose ORM.
- **AI/Extraction Layer**: Google Gemini 1.5 Flash Vision. The backend passes the base64 encoded document to the Gemini multimodal LLM, avoiding a middle-man OCR tool, converting raw image directly to structured JSON (invoice metadata, line items, totals) with native context.

## Key Design Decisions

1. **Direct Vision-to-JSON Pipeline**: Instead of using rudimentary OCR (like Tesseract) piped into an LLM parsing layer, which usually causes a severe loss of spatial metadata, we pass the image directly to Gemini 1.5. This handles both unstructured recognition and semantic parsing sequentially, delivering high fidelity data.
2. **Vanilla CSS + Glassmorphism**: To establish a remarkably modern app while avoiding generic templates, we used manually crafted CSS variables with a Glassmorphism design and deep harmonious palettes.
3. **MERN Stack**: A pivot from the original Python specification in order to create a deeply cohesive JavaScript ecosystem, easing local deployment and cloud-forward scalability.

## Assumptions & Limitations
- **Format Consistency**: We assume the model will extract fields correctly and handle the transformation natively. Extremely blurry or illegible handwritten invoices might reduce accuracy.
- **Deployment**: The current repository is set up with local variables and expects MongoDB locally or via an Atlas connection string.
- **File System**: Uploads are stored locally in the `backend/uploads` directory. For production deployment (e.g. Render/Vercel), this should be replaced with an S3 bucket or Supabase Storage bucket.

## Potential Improvements

1. **Format Template Caching**: While the LLM dynamically extracts formats, setting up a vector-matching system using embeddings to recognize *repetitive vendors* would reduce LLM usage and latency.
2. **Batch Processing Queue**: Setting up background workers (e.g., BullMQ) for multi-file bulk uploads to ensure the main event loop isn't blocked.
3. **Authentication Layer**: Implementing JWT session-based or Supabase Auth to scope invoices per-user instead of a global pool.

## Setup Instructions

1. **Clone & Install**:
   \`\`\`bash
   # Terminal 1 - Frontend
   cd frontend
   npm install
   npm run dev

   # Terminal 2 - Backend
   cd backend
   npm install
   \`\`\`

2. **Environment Variables**:
   Update `backend/.env` with your actual MongoDB URI, and your Google Gemini API Key (`GEMINI_API_KEY`).

3. **Start Servers**:
   Run `npm run dev` in the frontend directory.
   Run `node server.js` in the backend directory.
   Go to `http://localhost:5173`
