const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config.js')
const encrypto = require('../../utils/myCrypto.js')
const myJwt = require('../../utils/myJwt')


const db = mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE
});


/* --------------------------------------
                    회원가입
-----------------------------------------*/
const register = (req, res) => {
    if (req.is(["application/json", "json"])) {
        const {
            employeeNumber,
            password,
            name
        } = req.body;


        if (!employeeNumber || !password || !name) {
            res.status(400).json({
                message: '잘못된 회원정보입니다.'
            });
        } else {
            const encryptedPassword = encrypto(password);


            db.query('INSERT INTO gb_user (u_employee_number, u_password, u_name) VALUES(?, ?, ?)', [employeeNumber, encryptedPassword, name], (error, results, fields) => {
                if (error) {

                    if (error.errno == 1062) {
                        res.status(409).json({
                            message: '이미 존재하는 사원번호입니다.'
                        });
                    } else {
                        console.log(error);
                        res.status(500).json({
                            message: '(error : a0001)서버에서 오류가 발생했습니다.'
                        })
                    }

                } else {
                    res.status(201).json({
                        message: '회원가입 성공'
                    });
                }
            });
        }

    } else {
        res.status(415).json({
            message: '잘못된 요청타입입니다.'
        });

    }

}

/* --------------------------------------
                    로그인
-----------------------------------------*/
const login = (req, res) => {
    if (req.is(["application/json", "json"])) {
        const {
            employeeNumber,
            password
        } = req.body;

        if (!employeeNumber || !password) {
            res.status(400).json({
                message: '잘못된 로그인정보입니다.'
            });
        } else {
            const encryptedPassword = encrypto(password);

            db.query('SELECT u_employee_number, u_password, u_name FROM gb_user WHERE u_employee_number = ?', [employeeNumber], (error, results, fields) => {
                if (error) {
                    console.log(error);
                    // db 에러
                    res.status(500).json({
                        message: '(error : a0002) 서버에서 오류가 발생했습니다.'
                    });
                } else {
                    if (results.length <= 0) {
                        // 없는 경우
                        res.status(404).json({
                            message: '존재하지 않는 사원번호입니다.'
                        });
                    } else if (results.length > 1) {
                        // 결과가 1초과?
                        res.status(500).json({
                            message: '(error : a0003)서버에서 오류가 발생했습니다.'
                        });
                    } else {
                        if (encryptedPassword !== results[0].u_password) {
                            // 비밀번호 틀림
                            res.status(403).json({
                                message: '비밀번호가 틀렸습니다.'
                            });
                        } else {
                            myJwt.makeToken(results[0].u_employee_number, results[0].u_name).then((token) => {
                                res.status(200).json({
                                    message: '로그인 성공, 토큰 발행',
                                    token: token
                                });
                            }, (error) => {
                                console.log(error);
                                res.status(500).json({
                                    message: '(error : a0004) 서버에서 오류가 발생했습니다.'
                                });
                            });

                        }
                    }
                }
            });
        }
    } else {
        res.status(415).json({
            message: '잘못된 요청타입입니다.'
        });
    }
}

/* --------------------------------------
               토큰 확인용 임시
-----------------------------------------*/
const test = (req, res) => {
    const {
        token
    } = req.body;

    myJwt.verifyToken(token).then((decoded) => {
        console.log('decoded : ', decoded);
        res.json(decoded);
    }, (error) => {
        console.log('test error :', error);
        res.json(error);
    });
}

router.post('/test', test);
router.post('/login', login);
router.post('/register', register);
module.exports = router;
