// 메인
app.get('/');

// 공통

// 회원가입 페이지
app.get('/join');

// 회원가입 프로세스
app.post('/join_process');

// 로그인 프로세스 (사용자, 관리자 모드로 로그인)
app.post('/login_process');

// 로그아웃 기능
app.get('/logout');

// 마이페이지 (사용자, 매니저 mode 따라 나뉨)
app.get('/My_page');

// 채팅 기능
app.get('/chatting');

// 소켓 이용 채팅 연결
io.on('connection');

// 가이드 페이지 이동
app.get('/guide');

// 매니저

// manager 페이지
app.get('/manager');

// 매니저 로그인 페이지
app.get('/login_manager');

// 매니저 프로필 페이지
app.get('/manager_profile');

// 매니저 프로필 변경 기능
app.post('/changeProfile_manager');

// 매니저 회원 탈퇴
app.post('/drop_manager');

// 매니저 상점 관리 페이지
app.get('/manager_market');

// 매니저가 가진 마켓 리스트 전송하는 기능
app.get('/getMarketList');

// 매니저 채팅 페이지
app.get('/manager_chatting');

// 매니저의 마켓에 대한 상품 리스트 이동 (마켓 이름 클릭 시 이동)
app.post('/manager_products');

// 매니저 상품 관리 페이지로 이동, 가장 처음 부터 출력
app.get('/manager_products');

// 매니저 페이지에서 AJAX 이용시, 상점 인덱스를 통해 상품 리스트 전송하는 기능
app.get('/getProductList');

// 관리자가 마켓 검색한 후, AJAX를 이용해 마켓 정보 전송
app.get('/getMarketInfo');

// 매니저가 상점 추가하는 페이지
app.get('/manager_market_insert');

// 매니저가 상점 추가하는 기능
app.post('/insertMarket');

// 매니저가 상점을 수정하는 페이지
app.get('/manager_market_modify');

// 매니저가 상점을 수정하는 기능
app.post('/modifyMarket');

// 매니저가 상품 리스트에서 상품을 수정하는 기능
app.get('/modifyProduct');

// 매니저가 상품 리스트에서 상품에 대한 바코드 정보 가져오는 기능
app.get('/getBarcodeInfo');

// 매니저가 상품 리스트에서 상품 추가
app.post('/insertProduct');

// 매니저가 상품 리스트에서 상품 삭제
app.get('/deleteProduct');

// 사용자

// 사용자 로그인 페이지
app.get('/login_user');

// 사용자 프로필 변경 기능
app.post('/changeProfile_user');

// 사용자 마켓 페이지
app.get('/User_market');

// 사용자가 물건 검색
app.get('/searchProduct');

// 사용자가 마켓 검색
app.get('/searchMarket');

// 사용자가 장바구니로 이동하는 페이지
app.get('/Cart');

// 사용자가 장바구니에 담는 기능
app.get('/cart_add');

// 사용자가 장바구니의 물품 구매하는 기능
app.get('/cart_buy');

// 사용자가 상품 구매시, DB 내의 재고를 수정하는 기능
app.post('/changeStock');

// 사용자가 구매시, 가격을 가져오는 기능
app.get('/getAccount');

// 사용자가 장바구니에서 상품을 삭제
app.post('/delete_cart');

// 사용자 장바구니를 쿠키에 추가
app.get('/add_cookie');