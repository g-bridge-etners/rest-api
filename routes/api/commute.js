const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config.js')
const myJwt = require('../../utils/myJwt')


const db = mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE
});


/* --------------------------------------
        사용자 현재 출퇴근 상태 조회
-----------------------------------------*/
const status = (req, res) => {

    const token = req.headers['x-access-token'];

    myJwt.verifyToken(token).then((decoded) => {
        db.query('SELECT t.c_status AS c_status, TIME(t.c_clock_in) AS c_clock_in_time, TIME(t.c_clock_out) AS c_clock_out_time FROM gb_temp t, gb_user u WHERE t.c_employee_number = ? AND t.c_date = curdate() AND t.c_employee_number = u.u_employee_number', [decoded.employeeNumber], (error, results, fields) => {
            if (error) {
                console.log(error);
                res.status(500).json({
                    message: '(error : c0003) 서버에서 오류가 발생했습니다.'
                });
            } else {
                if (results.length > 1) {
                    res.status(500).json({
                        message: '(error : c0004) 서버에서 오류가 발생했습니다.'
                    });
                } else if (results.length <= 0) {
                    res.status(200).json({
                        code: "csr0003",
                        name: decoded.name
                    });
                } else {
                    const currentStatus = results[0].c_status;
                    if (currentStatus === '출근중') {
                        res.status(200).json({
                            code: "csr0001",
                            name: decoded.name,
                            clock_in: results[0].c_clock_in_time
                        });
                    } else if (currentStatus === '퇴근완료') {
                        res.status(200).json({
                            code: "csr0002",
                            name: decoded.name,
                            clock_in: results[0].c_clock_in_time,
                            clock_out: results[0].c_clock_out_time
                        });
                    }
                }
            }
        });


    }, (error) => {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                error: 't0000',
                message: '만료된 토큰입니다.'
            });
        } else {
            res.status(401).json({
                error: 't0001',
                message: '유효하지 않은 토큰입니다.'
            });
        }
    });

}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

/* --------------------------------------
        사용자 출근 혹은 퇴근 처리
-----------------------------------------*/
const check = (req, res) => {
    if (req.is(['application/json', 'json'])) {
        const token = req.headers['x-access-token'];

        myJwt.verifyToken(token).then((decoded) => {
            const {
                method,
                type,
                latitude,
                longitude,
                ap
            } = req.body;

            if (!method || !type) {
                res.status(400).json({
                    message: '잘못된 전달인자입니다.'
                });
            } else {
                let isValidLocation = false;

                if (method === 'gps') {
                    db.query('SELECT l_latitude, l_longitude FROM gb_location WHERE l_method = "gps"', (error, results, fields) => {
                        if (error) {
                            res.status(500).json({
                                message: '(error : c0008) 서버에서 오류가 발생했습니다.'
                            });
                        } else {
                            results.forEach((item, i) => {
                                let comLatitude = item.l_latitude;
                                let comLongitude = item.l_longitude;
                                const distance = getDistanceFromLatLonInM(comLatitude, comLongitude, latitude, longitude);
                                if (distance <= 700) {
                                    isValidLocation = true;
                                }
                            });
                            done();
                        }
                    });
                } else if (method === 'wifi') {
                    db.query('SELECT l_ap FROM gb_location WHERE l_method = "wifi"', (error, results, fields) => {
                        if (error) {
                            res.status(500).json({
                                message: '(error : c0009) 서버에서 오류가 발생했습니다.'
                            });
                        } else {
                            results.forEach((item, i) => {
                                let comAp = item.l_ap;
                                if (comAp == ap) {
                                    isValidLocation = true;
                                }
                            });
                            done();
                        }
                    });
                } else {
                    res.status(400).json({
                        message: '잘못된 전달인자입니다.'
                    });
                }

                const done = () => {
                    if (isValidLocation) {
                        const employeeNumber = decoded.employeeNumber;
                      
                        if (type === 'in') {
                            db.query('SELECT c_status FROM gb_temp WHERE c_employee_number = ? AND c_date = curdate()', [decoded.employeeNumber], (error, results, fields) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({
                                        message: '(error : c0005) 서버에서 오류가 발생했습니다.'
                                    });
                                } else {
                                    if (results.length <= 0) {
                                        db.query('INSERT INTO gb_temp (c_employee_number, c_date, c_clock_in, c_status) VALUES(?, curdate(), curtime(), "출근중")', [employeeNumber], (error, results, fields) => {
                                            if (error) {
                                                console.log(error);
                                                res.status(500).json({
                                                    message: '(error : c0001) 서버에서 오류가 발생했습니다.'
                                                });
                                            } else {
                                                res.status(200).json({
                                                    message: '출근 완료'
                                                });
                                            }
                                        });
                                    } else {
                                        res.status(418).json({
                                            message: '이미 출근중 입니다.'
                                        });
                                    }
                                }
                            });

                        } else if (type === 'out') {
                            db.query('SELECT c_status FROM gb_temp WHERE c_employee_number = ? AND c_date = curdate()', [decoded.employeeNumber], (error, results, fields) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({
                                        message: '(error : c0006) 서버에서 오류가 발생했습니다.'
                                    });
                                } else {
                                    if (results.length <= 0) {
                                        res.status(418).json({
                                            message: '아직 출근하지 않았습니다.'
                                        });

                                    } else if (results[0].c_status === '퇴근완료') {
                                        res.status(418).json({
                                            message: '이미 퇴근했습니다.'
                                        });

                                    } else {
                                        db.query('UPDATE gb_temp SET c_clock_out = curtime(), c_status = "퇴근완료" WHERE c_employee_number = ? AND c_date = curdate() AND c_status = "출근중"',
                                            [employeeNumber], (error, results, fields) => {
                                                if (error) {
                                                    console.log(error);
                                                    res.status(500).json({
                                                        message: '(error : c0002) 서버에서 오류가 발생했습니다.'
                                                    });
                                                } else {
                                                    res.status(200).json({
                                                        message: '퇴근 완료'
                                                    });
                                                }
                                            });
                                    }
                                }
                            });

                        } else {
                            res.status(400).json({
                                message: '잘못된 전달인자입니다.'
                            });
                        }

                    } else {
                        res.status(406).json({
                            message: '위치가 회사가 아닙니다.'
                        });
                    }
                }
            }
          }
        }, (error) => {
            if (error.name === "TokenExpiredError") {
                res.status(401).json({
                    error: 't0000',
                    message: '만료된 토큰입니다.'
                });
            } else {
                res.status(401).json({
                    error: 't0001',
                    message: '유효하지 않은 토큰입니다.'
                });
            }
        });
    } else {
        res.status(415).json({
            message: '잘못된 요청타입입니다.'
        });
    }
}

/* --------------------------------------
        사용자 출퇴근 기록 조회
-----------------------------------------*/
const history = (req, res) => {

    const token = req.headers['x-access-token'];

    myJwt.verifyToken(token).then((decoded) => {
        db.query('SELECT c_status, DATE_FORMAT(c_date, "%y-%m-%d") AS c_date, TIME(c_clock_in) AS c_clock_in_time,  TIME(c_clock_out) AS c_clock_out_time FROM gb_temp WHERE c_employee_number = ? ORDER BY c_date ASC', [decoded.employeeNumber], (error, results, fields) => {
            if (error) {
                console.log(error);
                res.status(500).json({
                    message: '(error : c0007) 서버에서 오류가 발생했습니다.'
                });
            } else {
                if (results.length <= 0) {
                    res.status(404).json({
                        message: '출퇴근 기록이 없습니다.'
                    });
                } else {
                    let history = [];
                    results.forEach((item, i) => {
                        history.push({
                            status: item.c_status,
                            date: item.c_date,
                            clockInTime: item.c_clock_in_time,
                            clockOutTime: item.c_clock_out_time
                        })
                    });
                    res.status(200).json({
                        message: "출퇴근 기록 반환 성공",
                        history: history
                    });

                }
            }
        });


    }, (error) => {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                error: 't0000',
                message: '만료된 토큰입니다.'
            });
        } else {
            res.status(401).json({
                error: 't0001',
                message: '유효하지 않은 토큰입니다.'
            });
        }
    });

}


router.get('/status', status);
router.patch('/check', check);
router.get('/history', history);
module.exports = router;
