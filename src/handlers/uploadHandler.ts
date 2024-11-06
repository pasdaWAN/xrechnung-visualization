import XRechnungParser from '../services/XRechnungParser';

async function handleXRechnungUpload(file: File) {
    try {
        const content = await file.text();
        const parser = new XRechnungParser(content);
        const invoiceData = parser.parse();
        
        // Return parsed data instead of raw content
        return {
            success: true,
            data: invoiceData
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export default handleXRechnungUpload; 