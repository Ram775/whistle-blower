import crypto from 'crypto';

export const decryptClientIdNumber = (encryptedB64) => {
    // Agar string me 'eyJ' se start ho raha hai, toh ye Laravel ka encrypted format hai
    // Agar nahi hai, toh ye plain text hai, seedha return kar do
    if (!encryptedB64 || !encryptedB64.startsWith('eyJ')) {
        return encryptedB64; 
    }

    try {
        const key = Buffer.from(process.env.CLIENT_ENCRYPTION_KEY, 'base64');
        const combined = Buffer.from(encryptedB64, 'base64');

        const ivLength = 12;
        const tagLength = 16;
        
        const iv = combined.subarray(0, ivLength);
        const tag = combined.subarray(combined.length - tagLength);
        const ciphertext = combined.subarray(ivLength, combined.length - tagLength);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(ciphertext, null, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Decryption Error:", error.message);
        return encryptedB64; // Fallback
    }
};