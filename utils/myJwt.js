const jwt = require('jsonwebtoken');
const config = require('../config.js');
const KEY = config.JWT_KEY;



const myJwt = {
    makeToken: (employeeNumber, name, department) => {
        return new Promise((resolve, reject) => {
            const token = jwt.sign({
                    employeeNumber: employeeNumber,
                    name: name,
                    department : department
                },
                KEY, {
                    expiresIn: '12h',
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
                    reject(error);
                } else {
                    resolve(decoded);
                }
            });
        })
    }
}

module.exports = myJwt;
