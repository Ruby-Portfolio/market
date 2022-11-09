## 기술 스택
- TypeScript, NestJS, MongoDB

## 구현 기능

<details>
<summary>회원 가입 / 로그인</summary>

- 이메일, 이름, 연락처, 비밀번호를 입력하여 회원 가입
  - 비밀번호는 최소 하나 이상의 알파벳, 하나 이상의 숫자를 포함한 최소 8자 이상으로 입력
- 이메일과 비밀번호를 입력하여 로그인 처리
  - 로그인 성공시 세션을 통해 인증 처리
- 로그아웃시 세션과 쿠키를 제거
</details>

<details>
<summary>마켓 등록</summary>

- 마켓 명, 이메일, 연락처, 국가를 입력받아 마켓 정보 등록
- 국가 목록은 enum 으로 관리
</details>

<details>
<summary>상품 등록</summary>

- 상품 명, 가격, 재고, 카테고리, 마켓 ID, 주문 마감일 값을 입력 받아 상품 정보 등록
- 마켓을 등록한 셀러가 해당 마켓에 상품 정보를 등록
- 카테고리 목록은 enum 으로 관리
</details>

<details>
<summary>상품 목록 조회</summary>

- 카테고리, 국가, 상품명을 통해 검색하여 해당하는 상품 목록을 조회
- 최근에 등록한 순으로 정렬하여 조회
</details>

<details>
<summary>상품 상세 조회</summary>

- 상품 ID를 입력받아 해당 상품 명, 가격, 국가, 주문 마감일, 마켓 명, 마켓 이메일, 마켓 연락처를 조회
</details>

<details>
<summary>상품 정보 수정</summary>

- 상품을 등록한 셀러는 등록한 상품의 상품 명, 가격, 재고, 카테고리, 주문 마감일 정보를 수정 가능
</details>

<details>
<summary>상품 정보 삭제</summary>

- 상품을 등록한 셀러는 해당 상품의 정보를 삭제 가능
</details>

## API

<details>
<summary>유저</summary>

- 회원 가입

| Method | URL              | Request Body                                                    | Response         |
|--------|------------------|-----------------------------------------------------------------|------------------|
| POST   | /api/auth/signUp | email : 이메일<br>name : 이름<br>phone : 연락처<br>password : 비밀번호 | statusCode : 201 |

- 로그인

| Method | URL             | Request Body                      | Response         |
|--------|-----------------|-----------------------------------|------------------|
| POST   | /api/auth/login | email : 이메일<br>password : 비밀번호 | statusCode : 201 |

- 로그아웃

| Method | URL              | Response         |
|--------|------------------|------------------|
| POST   | /api/auth/logout | statusCode : 200 |

</details>

<details>
<summary>마켓</summary>

- 마켓 등록

| Method | URL          | Request Body                                                      | Response         |
|--------|--------------|-------------------------------------------------------------------|------------------|
| POST   | /api/markets | name : 마켓명<br>email : 이메일<br>phone : 연락처<br>country : 판매국가  | statusCode : 201 |

</details>


<details>
<summary>상품</summary>

- 상품 등록

| Method | URL           | Request Body                                                                                                  | Response         |
|--------|---------------|---------------------------------------------------------------------------------------------------------------|------------------|
| POST   | /api/products | name : 상품명<br>price : 상품가격<br>stock : 재고<br>category : 카테고리<br>deadline : 주문 마감일<br>marketId : 마켓 Id | statusCode : 201 |

- 상품 목록 조회

| Method | URL           | Request Parameter                                                              | Response                                                                                                                                                       |
|--------|---------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET    | /api/products | country : 국가명<br>category : 카테고리<br>page : 조회 페이지 번호<br>keyword : 검색어Id | statusCode : 200 <br>products : {<br>&nbsp;&nbsp;id : 상품 id<br>&nbsp;&nbsp;name : 상품명<br>&nbsp;&nbsp;price : 상품 가격<br>&nbsp;&nbsp;country : 국가명<br>} [ ] |

- 상품 상세 조회

| Method | URL               | Request Path | Response                                                                                                                                                                                                                                                                                                                                                                                                      |
|--------|-------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET    | /api/products/:id | id : 상품 id  | statusCode : 200<br>product : {<br>&nbsp;&nbsp;id : 상품 id<br>&nbsp;&nbsp;name : 상품명<br>&nbsp;&nbsp;price : 상품 가격<br>&nbsp;&nbsp;country : 국가명<br>&nbsp;&nbsp;deadline : 주문 마감일<br>&nbsp;&nbsp;market : {<br>&nbsp;&nbsp;&nbsp;&nbsp;id : 마켓 id<br>&nbsp;&nbsp;&nbsp;&nbsp;name : 마켓명<br>&nbsp;&nbsp;&nbsp;&nbsp;email : 마켓 email<br>&nbsp;&nbsp;&nbsp;&nbsp;phone : 마켓 연락처<br>&nbsp;&nbsp;}<br>} |

- 상품 정보 수정

| Method | URL               | Request Path | Request Body                                                                             | Response         |
|--------|-------------------|--------------|------------------------------------------------------------------------------------------|------------------|
| PATCH  | /api/products/:id | id : 상품 id   | name : 상품명<br>price : 상품가격<br>stock : 재고<br>category : 카테고리<br>deadline : 주문 마감일 | statusCode : 204 |

- 상품 정보 삭제

| Method | URL               | Request Path | Response         |
|--------|-------------------|--------------|------------------|
| DELETE | /api/products/:id | id : 상품 id  | statusCode : 204 |

</details>