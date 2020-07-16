## REST API REFERENCE (작성중)
* description : 내 출퇴근 상태 확인 기능, 출퇴근 기능, 내 기록 확인 기능 업데이트
* version : 2.0
* server : http://34.82.68.95:3000/
----
### 회원가입 [POST]  /auth/register

#### Request
```
Content-Type : application/json
Body(json) : {
  "employeeNumber" : [사용자 사원번호],
  "password" : [사용자 비밀번호],
  "name" : [사용자 이름]
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
  "token" : [토큰]
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

### 토큰 확인용 임시기능 [POST]  "/auth/test"

#### Request
```
Content-Type : application/json
Body(json) : {
  "token" : [토큰]
}
```
#### Response
* [200] 토큰 검증 성공시 example
```
Status : 200
Content-Type : application/json
Body(json) : {
    "name": "test!!",
    "iat": 1594802901,
    "exp": 1594810101,
    "iss": "gbridge"
}
```
* [200] 토큰 만료시 example
> **토큰 유효시간 2시간으로 정상적인 기능**
```
Status : 200
Content-Type : application/json
Body(json) : {
    "name": "TokenExpiredError",
    "message": "jwt expired",
    "expiredAt": "2020-07-15T06:01:45.000Z"
}
```
* [200] 토큰 검증 실패 example
> **서버 로직 문제거나, 토큰 값이 기기에서 변경되는 경우 심각**
```
Status : 200
Content-Type : application/json
Body(json) : {
    "name": "JsonWebTokenError",
    "message": "invalid algorithm"
}
```
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
  "clock_in" : //resultCode 출근중, 퇴근완료 일때만 반환,
  "clock_out" : //resultCode 퇴근완료 일때만 반환
}
```  
> clock_in, clock_out example : "11:59:54"  
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
### 내 출퇴근 상태 확인 [PATCH]  /commute/check

#### Request
```
Content-Type : application/json
x-access-token : token
Body(json) : {
  "method" : "gps" or "wifi",
  "type" : "in" or "out", //in - 출근, out - 퇴근
  "latitude" : [Number latitude], //gps인 경우에만 작성
  "longitude" : [Number longitude], //gps인 경우에만 작성
  "aps" : [jsonArray aps] //wifi인 경우에만 작성
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
