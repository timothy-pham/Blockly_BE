var CryptoJS = require("crypto-js");

function encryptJSON(jsonData, secretKey) {
    try {
        const jsonString = JSON.stringify(jsonData);
        const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
        return encrypted
    } catch (error) {
        console.error("Error encrypting JSON:", error);
        return null;
    }
}

function decrypt(encrypted, secretKey) {
    try {
        const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Error decrypting JSON:", error);
        return null;
    }
}

module.exports = {
    encryptJSON,
    decrypt
};