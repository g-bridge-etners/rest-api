const crypto = require('crypto');
const config = require('../config.js');

const encrypto = (password) => {
    const key = Buffer.from(config.CRYPTO_KEY, 'hex');
    const cipher = crypto.createCipheriv('des-ecb', key, null);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

module.exports = encrypto;
