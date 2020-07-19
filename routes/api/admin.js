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
        관리자 사원별 근태 관리 수정 기능
-----------------------------------------*/
const putAttendance = (req, res) => {
    if (req.is(['application/json', 'json'])) {

        const token = req.headers['x-access-token'];
        myJwt.verifyToken(token).then((decoded) => {
            const {
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
                    [title, description, startDate, endDate, startTime, endTime, decoded.employeeNumber], (error, results, fields) => {
                        if(error){
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
        if(error) {
            console.log(error);
            res.status(500).json({
                message: '(error : ad0002) 서버에서 오류가 발생했습니다.'
            });
        } else {
            if (results.length <= 0){
                res.status(404).json({
                    message : '서버에 등록된 근무 정보가 없습니다.'
                });
            } else {
                let attendance = [];
                results.forEach((item, i) => {
                    attendance.push({
                        name : item.u_name,
                        employeeNumber : item.u_employee_number,
                        department : item.u_department,
                        title : item.a_title,
                        description : item.a_description,
                        startDate : item.a_start_date,
                        endDate : item.a_end_date,
                        startTime : item.a_start_time,
                        endTime : item.a_end_time
                    })
                });
                res.status(200).json({
                    message : "근무 정보 반환 성공",
                    attendance : attendance
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
router.get('/attendance', getAttendnace);
module.exports = router;
