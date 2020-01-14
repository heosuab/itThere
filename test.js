var http = require('http');
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');  //모듈 추출
var socket = require('socket.io');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tnfus1346',
    database: 'itThere'
});  //DB 연결

var app = express();  //웹 서버 생성
var server = http.Server(app);
var io = socket(server);

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.render('ItThere_main');
});

app.post('/search', function (request, response) {
    if(request.session.username){
        var keyword = request.body.keyword;
    
        if(keyword) {
            connection.query('SELECT g_idx FROM goods WHERE g_name = ?', [keyword], function (error, results, fields) {
                if(results.length>0) {
                    response.redirect('/search_success');
                } else {
                    response.redirect('/search_success');
                }
                response.end();
            });
        } else {
            response.end();
        }
    }
    else{
        response.send('<script type="text/javascript">alert("로그인한 사용자만 작성할 수 있습니다."); window.location="/"; </script>');

    }

});

app.get('/search_success', function(request, response) {
   response.render('User_search5');
});

app.get('/manager', function(request, response) {
   response.render('manager');
});

app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        repsonse.send('Please login to view this page');
    }
    response.end();
});


app.get('/login_user', function(request, response){
    request.session.login_mode="1";
    response.render('login', {success: "로그인 페이지"});
});

app.get('/login_manager', function(request, response){
    request.session.login_mode="2";
    response.render('login', {});
});

app.get('/manager_profile', function(request, response){
    response.render('manager_profile', {});
});

app.get('/manager_market', function(request, response){
    response.render('manager_market', {});
});

app.get('/manager_chatting', function(request, response){
    response.render('manager_chatting', {});
});

app.get('/User_market', function(request, response){
    response.render('User_market', {});
});

app.get('/chatting', function(request, response){
    response.render('chatting', {username:request.session.username, login_mode:request.session.login_mode});
});

app.post('/login_process', function(request, response){
    var username = request.body.username;
    var userpw = request.body.userpw;
    
    if(request.session.login_mode=="1") {
        connection.query('SELECT * FROM customers WHERE c_id=? and c_pw=?', [username, userpw], function(error, results, fields){
            if(results.length > 0){
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/');
            }else{
                response.send('<script type="text/javascript">alert("아이디 또는 비밀번호가 존재하지 않습니다."); window.location="/login_user"; </script>');
            }
        })
    }
    else if(request.session.login_mode=="2"){
        connection.query('SELECT * FROM managers WHERE m_id=? and m_pw=?', [username, userpw], function(error, results, fields) {
            if(results.length > 0){
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/manager');
            }else{
                response.send('<script type="text/javascript">alert("아이디 또는 비밀번호가 존재하지 않습니다."); window.location="/login_manager"; </script>');
            }
        })
    }
})

app.get('/join', function(request, response) {
   response.render('join', {success: "회원가입 페이지"}); 
}); //join 페이지 이동

app.get('/manager_products', function(request, response){
    
    connection.query('SELECT * FROM stores WHERE s_idx=(SELECT min(s_idx) FROM stores where s_idx>0 and m_name=?)', [request.session.username], function(error, result) {
        if(error){
            throw error;
        }
        if(result.length>0){
            
            response.render('manager_products', {market:result[0].s_idx, market_name:result[0].s_name});
        }
        else {
            response.render('manager_products', {market:0, market_name:'보유한 매장이 없습니다.'});
        }
    })
    
});

app.get('/right/get', function(request, response) {
    var next_s_idx=0;
    var next_s_name='';
   var data = request.query.data;
    
    connection.query('SELECT * from stores where s_idx=(select min(s_idx) from stores where s_idx>? and m_name=?)', [data, request.session.username], function(e, results) {
        if(e){
            throw e;
        }
        if(results.length>0) {
            next_s_idx = results[0].s_idx;
            next_s_name = results[0].s_name;

            connection.query('SELECT * FROM goods WHERE g_s_idx=?', [next_s_idx], function(error, result, fields) {
                if(error) {
                    console.log(error);
                }
                if(result.length>0) {
                    response.send({
                        result:result, next_s_idx:next_s_idx, next_s_name:next_s_name});
                }
            });
        }
        else if(results.length<=0){
            var error_data='마지막 매장입니다.';
            response.send({error_data:error_data});
        }
    });
    
});

app.get('/left/get', function(request, response) {
    var next_s_idx=0;
    var next_s_name='';
   var data = request.query.data;
    
    connection.query('SELECT * from stores where s_idx=(select min(s_idx) from stores where s_idx<? and m_name=?)', [data, request.session.username], function(e, results) {
        if(e){
            throw e;
        }
        if(results.length>0) {
            next_s_idx = results[0].s_idx;
            next_s_name = results[0].s_name;

            connection.query('SELECT * FROM goods WHERE g_s_idx=?', [next_s_idx], function(error, result, fields) {
                if(error) {
                    console.log(error);
                }
                if(result.length>0) {
                    response.send({
                        result:result, next_s_idx:next_s_idx, next_s_name:next_s_name});
                }
            });
        }
        else if(results.length<=0){
            var error_data='첫 매장입니다.';
            response.send({error_data:error_data});
        }
    });
    
});

app.get('/now/get', function(request, response) {
   var data = request.query.data;
    
    var next_s_idx=0;
    var next_s_name='';
   var data = request.query.data;
    
    connection.query('SELECT * from stores where s_idx=? and m_name=?', [data, request.session.username], function(e, results) {
        if(e){
            throw e;
        }
        if(results.length>0) {
            next_s_idx = results[0].s_idx;
            next_s_name = results[0].s_name;

            connection.query('SELECT * FROM goods WHERE g_s_idx=?', [next_s_idx], function(error, result, fields) {
                if(error) {
                    console.log(error);
                }
                if(result.length>0) {
                    response.send({
                        result:result, next_s_idx:next_s_idx, next_s_name:next_s_name});
                }
            });
        }
        else if(results.length<=0){
            var error_data='보유한 매장이 없습니다.';
            response.send({error_data:error_data});
        }
    });
    
});

app.post('/join_process', function(request, response) {
    var userId = request.body.userId;
    var userPw = request.body.userPw;
    var userName = request.body.userName;
    var setting = request.body.r3;
    
    if(setting=="1"){
        connection.query('INSERT INTO customers(c_id, c_pw, c_name) values(?,?,?)', [userId, userPw, userName], function(error, results){
            if(error) throw error;
        });
    }
    else if(setting=="2"){
        connection.query('INSERT INTO managers(m_id, m_pw, m_name) values(?,?,?)', [userId, userPw, userName], function(error, results){
            if(error) throw error;
        });
    }
    
    response.render('login');
});

var idList = [];
var userList = [];

io.on('connection', function(socket) {
 
    socket.on('SEND', function(data) {
        if(data.login_mode=="1") {
            io.to(idList[data.target]).emit('SEND', {msg:data.msg, username:data.username});
        }
        else if(data.login_mode=="2") {
            if(data.msg[0]=='(') {
                var index = data.msg.indexOf(')');
                var target = data.msg.substring(1,index);
                var newMsg = data.msg.substring(index+1,data.msg.length);
                
                io.to(idList[target]).emit('SEND', {msg:newMsg, username:data.username});
            }
            else {
                var str='"(고객이름)메세지"로 입력해야 전달됩니다.'
                io.to(idList[data.username]).emit('enter', {msg:str});
            }
        }
    });
 
    socket.on('disconnect', function() {
        var index = userList.indexOf(socket.username);
        userList.splice(index,1);
        
        io.emit('enter', {msg:socket.username+'님이 나갔습니다.'});
    });
    
    socket.on('add user', function(username) {
       idList[username]=socket.id;
        socket.username=username;
        userList.push(username);
        
        io.emit('enter',{msg:socket.username+'님이 들어왔습니다.'});
        
    });
    
    socket.on('market user', function(data) {
        if(data.login_mode=="2"){
            var str='"(고객이름)메세지"로 입력하면 고객에게 메세지를 전달할 수 있습니다. 문의에 답변해보세요.';
            io.to(idList[data.username]).emit('enter', {msg:str});
        }
        else if(data.login_mode=="1"){
            var str='안녕하세요 '+data.market+'입니다:) 문의 주시면 답변 드리겠습니다.';
            io.to(idList[socket.username]).emit('user_enter', {msg:str, market:data.market});
        }
    });
    
});

server.listen(5000, function() {
    console.log('Server On !');
});