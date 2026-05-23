/**
 * Debug endpoint - shows what code is actually running on Vercel
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  try {
    // Check what modules are available
    const modules = {};
    
    try {
      await import("pdfkit");
      modules.pdfkit = "✅ AVAILABLE";
    } catch (e) {
      modules.pdfkit = "❌ NOT AVAILABLE";
    }
    
    try {
      await import("pdf-lib");
      modules["pdf-lib"] = "⚠️ STILL INSTALLED (should be removed!)";
    } catch (e) {
      modules["pdf-lib"] = "✅ Correctly removed";
    }
    
    // Check PDF generator source
    const { generatePdfReport } = await import("./utils/pdf-generator.js");
    const genString = generatePdfReport.toString();
    const usesPDFKit = genString.includes("PDFDocument");
    const usesPdfLib = genString.includes("pdf-lib");
    
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      node_version: process.version,
      modules,
      pdf_generator: {
        uses_pdfkit: usesPDFKit,
        uses_pdf_lib: usesPdfLib,
        first_100_chars: genString.substring(0, 100)
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
