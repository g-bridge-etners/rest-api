const jwt = require('jsonwebtoken');
const config = require('../config.js');
const KEY = config.JWT_KEY;



const myJwt = {
    makeToken: (id, name) => {
        return new Promise((resolve, reject) => {
            const token = jwt.sign({
                    id: id,
                    name: name
                },
                KEY, {
                    expiresIn: '2h',
                    issuer: 'gbridge'
                },
                (error, token) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(token);
                    }
                }
            )
        })
    },

    verifyToken: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, KEY, (error, decoded) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log('token : ', token);
                    resolve(decoded);
                }
            });
        })
    }
}

module.exports = myJwt;
