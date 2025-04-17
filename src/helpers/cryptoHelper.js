const CryptoJS = require('crypto-js');

const key = 'nexatest';

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };
