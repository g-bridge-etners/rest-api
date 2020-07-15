const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config.js')
const encrypto = require('../../utils/myCrypto.js')


const db = mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE
});

const register = (req, res) => {
    if(req.is(["application/json", "json"])) {
        const {
            id,
            password,
            name
        } = req.body;
        console.log("id :", id, "password :", password, "name :", name);
        console.log("idtype :", typeof(id));


        if (!id || !password || !name) {
            res.status(400).json({
                message: '잘못된 회원정보입니다.'
            });
        }


        const encryptedPassword = encrypto(password);


        db.query('INSERT INTO gb_user (u_id, u_password, u_name) VALUES(?, ?, ?)', [id, encryptedPassword, name], (error, results, fields) => {
            if (error) {

                if (error.errno == 1062) {
                    res.status(409).json({
                        message: '이미 존재하는 아이디입니다.'
                    });
                } else {
                    console.log(error);
                    res.status(500).json({
                        message: '서버에서 오류가 발생했습니다.'
                    })
                }

            } else {
                res.status(201).json({
                    message: '회원가입 성공'
                });
            }
        });
    } else {
        if (!id || !password || !name) {
            res.status(415).json({
                message: '잘못된 요청타입입니다.'
            });
        }
    }

}

router.post('/register', register);
module.exports = router;
