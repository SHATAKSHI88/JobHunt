import pdfParse from "pdf-parse";

/**
 * Extracts plain text from a PDF file buffer (e.g. straight from multer's
 * memoryStorage, before it's uploaded to Cloudinary).
 */
export const extractTextFromBuffer = async (buffer) => {
    const data = await pdfParse(buffer);
    return data.text || "";
};

/**
 * Extracts plain text from a PDF hosted at a URL (e.g. a Cloudinary resume
 * URL already stored on a User's profile).
 */
export const extractTextFromUrl = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            throw new Error(
                `Cloudinary refused to serve this PDF (${res.status}). Your Cloudinary account likely has "PDF and ZIP file delivery" disabled by default — enable it at console.cloudinary.com → Settings → Security → "Allow delivery of PDF and ZIP files".`
            );
        }
        throw new Error(`Failed to download PDF (${res.status})`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return extractTextFromBuffer(Buffer.from(arrayBuffer));
};
