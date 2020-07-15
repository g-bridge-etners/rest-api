## REST API DOCS (작성중)
* version : 1.0 
* server : http://34.82.68.95:3000/
----
### 회원가입 [POST]  /auth/register

#### Request
```
Content-Type : application/json
Body(json) : {
  "id" : [사용자 아이디],
  "password" : [사용자 비밀번호],
  "name" : [사용자 이름]
}
```
#### Response
* 회원가입 성공시
```
Status : 201
Content-Type : application/json
Body(json) : {
  "message" : "회원가입 성공"
}
```  

* 아이디 중복시
```
Status : 409
Content-Type : application/json
Body(json) : {
  "message" : "이미 존재하는 아이디입니다."
}
```  
* Request argument null일때
```
Status : 400
Content-Type : application/json
Body(json) : {
  "message" : "잘못된 요청입니다."
}
``` 
* 서버 오류시
```
Status : 500
Content-Type : application/json
Body(json) : {
  "message" : "서버에서 오류가 발생했습니다."
}
``` 
