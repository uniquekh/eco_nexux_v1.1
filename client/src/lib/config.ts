// API Configuration - Centralized
export const API_CONFIG = {
  FASTAPI_BASE: "https://api-hack-virid.vercel.app",
  MONGO_URI: "mongodb+srv://new_helper:XwVQOu0PvrvSMx3M@cluster0.wd3ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  GEMINI_API_KEY: "AIzaSyCObiw1MJMvLh8OfPeYHyFa8AjNLIw-_CQ",
};

// Helper functions for API calls
export const generateUniqueRFID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rfid = '';
  for (let i = 0; i < 10; i++) {
    rfid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rfid;
};

export const generateTxnId = async (email: string, date: string, rfid: string, prevTxnId: string | null = null) => {
  const data = `${email}|${date}|${rfid}|${prevTxnId || 'null'}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const shortHash = hashHex.substring(0, 16);
  const dateFormatted = date.replace(/-/g, '');
  return `TXN-${dateFormatted}-${shortHash}`;
};
