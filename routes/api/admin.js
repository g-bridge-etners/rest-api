const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config.js')
const myJwt = require('../../utils/myJwt')
const moment = require('moment');


const db = mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE
});


/* --------------------------------------
        관리자 사원별 근태 관리 수정 기능
-----------------------------------------*/
const putAttendance = (req, res) => {
    if (req.is(['application/json', 'json'])) {

        const token = req.headers['x-access-token'];
        myJwt.verifyToken(token).then((decoded) => {
            const {
                name,
                employeeNumber,
                department,
                title,
                description,
                startDate,
                endDate,
                startTime,
                endTime
            } = req.body;

            if (!title || !description || !startDate || !endDate || !startTime || !endTime) {
                res.status(400).json({
                    message: '잘못된 전달인자입니다.'
                });
            } else {
                db.query('UPDATE gb_attendance SET a_title = ?, a_description = ?, a_start_date = ?, a_end_date = ?, a_start_time = STR_TO_DATE(?, "%H:%i"), a_end_time = STR_TO_DATE(?, "%H:%i") WHERE a_employee_number = ?',
                    [title, description, startDate, endDate, startTime, endTime, employeeNumber], (error, results, fields) => {
                        if (error) {
                            console.log(error);
                            res.status(500).json({
                                message: '(error : ad0001) 서버에서 오류가 발생했습니다.'
                            });
                        } else {
                            res.status(200).json({
                                message: '근무일정 수정에 성공했습니다.'
                            });
                        }
                    });
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
        관리자 사원별 근태 관리 조회 기능
-----------------------------------------*/
const getAttendnace = (req, res) => {
    const token = req.headers['x-access-token'];

    myJwt.verifyToken(token).then((decoded) => {
        db.query('SELECT u_employee_number, u_name, u_department, a_title, a_description, a_start_date, a_end_date, a_start_time, a_end_time FROM gb_user, gb_attendance WHERE u_employee_number = a_employee_number ORDER BY u_employee_number ASC, a_employee_number ASC',
            (error, results, fields) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        message: '(error : ad0002) 서버에서 오류가 발생했습니다.'
                    });
                } else {
                    if (results.length <= 0) {
                        res.status(404).json({
                            message: '서버에 등록된 근무 정보가 없습니다.'
                        });
                    } else {
                        let attendance = [];
                        results.forEach((item, i) => {
                            attendance.push({
                                name: item.u_name,
                                employeeNumber: item.u_employee_number,
                                department: item.u_department,
                                title: item.a_title,
                                description: item.a_description,
                                startDate: (item.a_start_date == null ? null : moment(item.a_start_date).format('YY-MM-DD')),
                                endDate: (item.a_end_date == null ? null : moment(item.a_end_date).format('YY-MM-DD')),
                                startTime: (item.a_start_time == null ? null : moment(item.a_start_time).format('HH:mm')),
                                endTime: (item.a_end_time == null ? null : moment(item.a_end_time).format('HH:mm'))
                            })
                        });
                        res.status(200).json({
                            message: "근무 정보 반환 성공",
                            attendance: attendance
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



const getDailyReport = (req, res) => {
    const token = req.headers['x-access-token'];
    const date = req.params.date;

    myJwt.verifyToken(token).then((decoded) => {
        db.query(`SELECT a.a_employee_number, a.a_start_time AS start_time, a.a_end_time AS end_time, c.c_date as date, c.c_clock_in AS clock_in, c.c_clock_out AS clock_out, u.u_name AS name, u.u_department AS department, u.u_employee_number AS employee_number
        FROM gb_attendance a
        LEFT JOIN gb_temp c ON a.a_employee_number = c.c_employee_number AND c.c_date = ?
        LEFT JOIN gb_user u ON a.a_employee_number = u.u_employee_number
        WHERE a.a_start_date <= ? AND a.a_end_date >= ?`,
            [date,date,date],
            (error, results, fields) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        message: '(error : ad0003) 서버에서 오류가 발생했습니다.'
                    });
                } else {
                    if (results.length <= 0) {
                        res.status(404).json({
                            message: '서버에 등록된 근무 기록이 없습니다.'
                        });
                    } else {
                        let dailyReport = [];
                        results.forEach((item, i) => {
                            dailyReport.push({
                                name: item.name,
                                employeeNumber: item.employee_number,
                                department: item.department,
                                startTime: (item.start_time == null ? null : moment(item.start_time).format('HH:mm')),
                                endTime: (item.end_time == null ? null : moment(item.end_time).format('HH:mm')),
                                clockInTime: (item.clock_in == null ? null : moment(item.clock_in).format('HH:mm')),
                                clockOutTime: (item.clock_out == null ? null : moment(item.clock_out).format('HH:mm'))
                            })
                        });
                        res.status(200).json({
                            message: "근무 기록 반환 성공",
                            dailyReport: dailyReport
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

router.put('/attendance', putAttendance);
router.get('/attendances', getAttendnace);
router.get('/report/daily/:date', getDailyReport);
module.exports = router;
