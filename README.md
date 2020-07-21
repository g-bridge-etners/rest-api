## REST API REFERENCE
* version : 3.2
* server : http://34.82.68.95:3000/
* changeLog
  * 1.0 : 로그인, 회원가입 기능  
  * 2.0 : 내 출퇴근 상태 확인 기능, 출퇴근 기능, 내 기록 확인 기능 업데이트
  * 2.1 
    * 출퇴근 기능 request Wifi AP 1개로 변경
    * 회원가입기능 request 회원정보에 부서 추가
    * 토큰 유효시간 12시간으로 변경
  * 2.2 : 내 출퇴근 상태 확인 기능 response에 사원명 추가
  * 3.0
    * 사원 근무 일정 수정 기능
    * 사원별 근무 일정 목록 조회 기능
    * 일자별 근태 기록 목록 조회 기능 추가
    * 내 출퇴근 상태 확인 기능 버그 
  * 3.1 : 일자별 근태 기록 uri 수정, 어드민 api 일부 버그 수정
  * 3.2
    * 회사 GPS, WIFI 정보 등록 기능 추가
    * 출퇴근시 GPS, WIFI 체크 로직 추가
    * 연동 과정에서 발생한 버그 수정
    * 토큰 확인용 임시기능 삭제

----
### 회원가입 [POST]  /auth/register

#### Request
```
Content-Type : application/json
Body(json) : {
  "employeeNumber" : [사용자 사원번호],
  "password" : [사용자 비밀번호],
  "name" : [사용자 이름],
  "department" : [사용자 부서]
}
```

#### Response
* [201] 회원가입 성공시
```
Status : 201
Content-Type : application/json
Body(json) : {
  "message" : "회원가입 성공"
}
```  
* [400] Request argument null일때
```
Status : 400
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 회원정보입니다."
}
``` 
* [409] 서버에 이미 존재하는 사원번호일때
```
Status : 409
Content-Type : application/json
Body(json) : {
  "message" : "이미 존재하는 사원번호입니다."
}
```  
* [415] Request Content-type 미지원시(json 아닌 경우)
```
Status : 415
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 요청타입입니다."
}
``` 
* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!

----
### 로그인 [POST]  /auth/login
* 로그인 성공시 반환되는 토큰은 기기에 저장!!

#### Request
```
Content-Type : application/json
Body(json) : {
  "employeeNumber" : [사용자 사원번호],
  "password" : [사용자 비밀번호]
}
```
#### Response
* [200] 로그인 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "로그인 성공, 토큰 발행",
  "token" : [토큰],
  "isAdmin" : [bool]
}
```
> token-example : eyJhbGciOiJIUzI1NaIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3RpZDIzIiwibmFtZSI6InRlc3RuYW1lIiwiaWF0IjoxNTk0Nzg2MDg2LCJleHAiOjE1OTQ3OTMyODYsImlzcyI6ImdicmlkZ2UifQ.UwRrFtLepGsr6W9VGkWvnoGWqWxJbpM1VHvLGloa3gE
* [400] Request argument null일때
```
Status : 400
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 로그인정보입니다."
}
```
* [403] 비밀번호가 틀렸을때
```
Status : 400
Content-Type : application/json
Body(json) : {
  "message" : "비밀번호가 틀렸습니다."
}
```
* [404] 서버에 존재하지 않는 사원번호일때
```
Status : 404
Content-Type : application/json
Body(json) : {
  "message" : "존재하지 않는 사원번호입니다."
}
```
* [415] Request Content-type 미지원시(json 아닌 경우)
```
Status : 415
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 요청타입입니다."
}
``` 
* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!
----
### 내 출퇴근 상태 확인 [GET]  /commute/status

#### Request
```
Header
x-access-token : token
```
#### Response
* [200] 출퇴근 기록 반환시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "code" : [resultCode],
  "name" : [userName],
  "clock_in" : //resultCode 출근중, 퇴근완료 일때만 반환,
  "clock_out" : //resultCode 퇴근완료 일때만 반환
}
```  
> clock_in, clock_out example : "13:59:54" (오후 1시 59분 54초)  
> resultCode
> * 출근중일때 : csr0001
> * 퇴근완료시 : csr0002
> * 미출근시 : csr0003  


* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.

* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!

----
### 출퇴근 기능 [PATCH]  /commute/check

#### Request
```
Content-Type : application/json
x-access-token : token
Body(json) : {
  "method" : "gps" or "wifi",
  "type" : "in" or "out", //in - 출근, out - 퇴근
  "latitude" : [Number latitude], //gps인 경우에만 작성
  "longitude" : [Number longitude], //gps인 경우에만 작성
  "ap" : [String ap] //wifi인 경우에만 작성
}
```
#### Response
* [200] 출퇴근 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "출근 완료" or "퇴근 완료"
}
```  

* [400] 전달인자 오류시
```
Status : 400
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 전달인자입니다."
}
```


* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.


* [406] 위치가 회사가 아닐 경우
```
Status : 406
Content-Type : application/json
Body(json) : {
  "message" : "위치가 회사가 아닙니다."
}
```


* [415] 잘못된 요청타입 (json 아닐 경우)
```
Status : 415
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 요청타입입니다."
}
```


* [418] 출퇴근 상태 체크 에러시 (ex. 출근중인데 출근체크 신청)
```
Status : 418
Content-Type : application/json
Body(json) : {
  "message" : [message]
}
```

* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!


----
### 내 출퇴근 기록 조회 [GET]  /commute/history
* 현재 날짜기준 오름차순 전체 리스트 조회만 제공

#### Request
```
Header
x-access-token : token
```
#### Response
* [200] 출퇴근 기록 반환 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "기록 반환 성공",
  "history" : [
    {
    "status" : [출퇴근 상태],
    "date" : [출퇴근 일자], // ex. 20-07-16 (2020년 7월 16일)
    "clockInTime" : [출근시간], // ex. 13:23:27 (오후 1시 23분 27초)
    "clockOutTime" : [퇴근시간] // ex. 13:25:40
    },
    
    ...
    
  ]
}
```  

* [404] 출퇴근 기록 없을때
```
Status : 404
Content-Type : application/json
Body(json) : {
  "message" : "출퇴근 기록이 없습니다."
}
``` 

* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.

* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!

----
### 관리자 - 사원 근무일정 수정 기능 [PUT]  /admin/attendance

#### Request
```
Content-Type : application/json
x-access-token : token
Body(json) : {
  "name" : [사원명],
  "employeeNumber" : [사원번호],
  "department" : [부서],
  "title" : [근무 제목],
  "description" : [근무 설명],
  "startDate" : [근무 시작 일자],   // 형식 "20-07-19"
  "endDate" : [근무 종료 일자],
  "startTime" : [근무 시작 시각],   // 형식 "18:37"
  "endTime" : [근무 종료 시각]
}
```
#### Response
* [200] 근무일정 수정 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "근무일정 수정에 성공했습니다.",
}
```
* [400] 전달인자 오류시
```
Status : 400
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 전달인자입니다."
}
```
* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.

* [415] 잘못된 요청타입 (json 아닐 경우)
```
Status : 415
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 요청타입입니다."
}
```

* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!


----
### 관리자 - 사원 근무일정 조회 기능 [GET]  /admin/attendances

#### Request
```
Header
x-access-token : token
```
#### Response
* [200] 근무일정 목록 조회 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "근무 정보 반환 성공",
  "attendance" : [
    {
    "name" : [사원명],
    "employeeNumber" : [사번],
    "department" : [사원 부서],
    "title" : [일정 제목],    // 없는 경우 null
    "description" : [일정 설명],    // 없는 경우 null
    "startDate" : [시작 일자],   // 없는 경우 null, 형식 "20-07-19"
    "endDate" : [종료 일자],    // 없는 경우 null
    "startTime" : [시작 시간],    // 없는 경우 null, 형식 "18:44"
    "endTime" : [종료 시간]    // 없는 경우 null
    },
    
    ...
    
  ]
}
```
* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.

* [404] 근무일정 없을때
```
Status : 404
Content-Type : application/json
Body(json) : {
  "message" : "서버에 등록된 근무 정보가 없습니다."
}
``` 

* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!

----
### 관리자 - 일자별 근태기록 목록 조회 기능 [GET]  /admin/report/daily/[date]
* 일자 형식 : 20-07-19

#### Request
```
Header
x-access-token : token
```
#### Response
* [200] 근태기록 목록 조회 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "근무 기록 반환 성공",
  "dailyReport" : [
    {
    "name" : [사원명],
    "employeeNumber" : [사번],
    "department" : [사원 부서],
    "title" : [일정 제목],     // 없는 경우 null
    "startTime" : [시작 시간],    // 없는 경우 null, 형식 "18:44"
    "endTime" : [종료 시간],    // 없는 경우 null
    "clockInTime" : [출근 시간],    // 없는 경우 null
    "clockOutTime" : [퇴근 시간]    // 없는 경우 null
    },
    
    ...
    
  ]
}
```
* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.

* [404] 근무기록 없을때
```
Status : 404
Content-Type : application/json
Body(json) : {
  "message" : "서버에 등록된 근무  없습니다."
}
``` 

* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!


----
### 관리자 - 회사 위치정보 등록 기능  [POST]  /admin/location
* 로그인 성공시 반환되는 토큰은 기기에 저장!!

#### Request
```
Content-Type : application/json
x-access-token : [token]
Body(json) : {
  "method" : [gps or wifi],
  "latitude" : [latitude], //gps인 경우에만 작성
  "longitude" : [longitude], // gps인 경우에만 작성
  "ap" : [ap] // wifi인 경우에만 작성
}
```
#### Response
* [200] 위치정보 등록 성공시
```
Status : 200
Content-Type : application/json
Body(json) : {
  "message" : "[method] 위치정보 등록 성공"
}
```

* [401] 토큰 검증 실패시
```
Status : 401
Content-Type : application/json
Body(json) : {
  "error" : [errorCode],
  "message" : [errorMessage]
}
```  
> errorCode, errorMessage
> * 토근 유효기간 만료시 : t0000, 만료된 토큰입니다. (토큰 재발급 필요)
> * 유효하지 않은 토큰시 : t0001, 유효하지 않은 토큰입니다.


* [415] Request Content-type 미지원시(json 아닌 경우)
```
Status : 415
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 요청타입입니다."
}
``` 
* [500] 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "(error : [에러코드])서버에서 오류가 발생했습니다."
}
``` 
> 발생시 errorCode 알려주세요!
