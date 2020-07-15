## REST API REFERENCE 1.0
* description : 개발용 회원가입, 로그인 REST API 
* version : 1.0 
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
#### Error Code
* a0001 : SERVER DB INSERT중 에러 발생.
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
#### Error Code
* a0002 : SERVER DB SELECT중 에러 발생.
* a0003 : SERVER DB에 해당 아이디 중복 존재.
* a0004 : SERVER 토큰 발행중 에러 발생.
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
