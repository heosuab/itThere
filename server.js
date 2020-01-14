var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');  //모듈 추출
var socket = require('socket.io');
var cookieParser = require('cookie-parser');
var connection = require('./config/dbConnection');
var app = express();  //웹 서버 생성
var server = http.Server(app);
var io = socket(server);



app.use(session({
    secret: 'defjewvsplasd;',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', function (request, response) {
    response.render('ItThere_main');
});

var joinRouter = require('./routes/join');
var loginRouter = require('./routes/login');
var managerRouter = require('./routes/manager');
var userRouter = require('./routes/user');
var searchRouter = require('./routes/search');

app.use('/join', joinRouter);
app.use('/login', loginRouter);
app.use('/user', userRouter);
app.use('/manager', managerRouter);
app.use('search', searchRouter);

app.get('/logout', function (request, response) {
    request.session.destroy();
    response.send('<script type="text/javascript">alert("로그아웃 되었습니다."); window.location="/"; </script>');
});


app.post('/drop_manager', function (request, response) {

});

app.get('/chatting', function (request, response) {
    var market = request.query.market;
    if(!request.session.username){
        response.redirect('/');
    }
    else{
        response.render('chatting', { username: request.session.username, login_mode: request.session.login_mode, market: market });
    }
});

app.use('/files', express.static('./uploads'));

var cartList = [];

app.get('/Cart', function (request, response) {
    var cart = request.cookies.cart;
    var username = request.session.username;
    var index = 1;
    if(username && request.session.login_mode=="1"){
        if (!cart) {
            response.render('Cart', { username: username, str: '장바구니가 비었습니다.', cart: null, error: '0' });
        }
        else {
            var output = '';
            var count = 0;
            for (var id in cart) {
                if (cart[id] != 0) {
                    var point = id.indexOf(')');
                    var ss_name = id.substring(1, point);
                    var gg_name = id.substring(point + 1, id.length);
                    var delete_str = 'delete';
                    var class_str = 'delete_cart';
                    var button_str = 'button';
    
                    output += `<tr><td>${index}</td><th>${gg_name}</th><td>${ss_name}</td><td>${cart[id]}개</td><td><input type=${button_str} class=${class_str} value=${delete_str} readonly></td></tr>`
                    index++;
                }
            }
            if (output == '') {
                response.clearCookie('cart');
            }
            response.render('Cart', { username: username, cart: output });
        }    
    }else{
        response.redirect('/login/user');
    }

});

app.get('/cart_add', function (request, response) {

    var gg_name = request.query.gg_name;
    var ss_name = request.query.ss_name;
    var gg_stock_num = request.query.gg_stock_num;

    response.render('cart_add', { gg_name: gg_name, ss_name: ss_name, gg_stock_num: gg_stock_num });
})

app.get('/cart_buy', function (request, response) {

    var cart = request.cookies.cart;
    var output = '';
    var index = 1;

    for (var id in cart) {
        if (cart[id] != 0) {
            var point = id.indexOf(')');
            var ss_name = id.substring(1, point);
            var gg_name = id.substring(point + 1, id.length);
            var checkbox_str = 'checkbox';
            var class_str = 'account';
            var checkbox_class = 'buy_check';

            output += `<tr><td><input type=${checkbox_str} class=${checkbox_class}></td><td>${index}</td><th>${gg_name}</th><td>${ss_name}</td><td>${cart[id]}</td><td class=${class_str}></td></tr>`;
            index++;
        }
    }
    response.render('cart_buy', { cart: output });
});

app.post('/changeStock', function (request, response) {
    var g_name = request.body.g_name;
    var s_name = request.body.s_name;
    var number = request.body.number;
    var cart = request.cookies.cart;

    connection.query('SELECT * from stores where s_name=?', [s_name], function (error, results) {
        if (error) { console.log(error); }
        else {
            connection.query('update goods set g_stock_num=g_stock_num-? where g_s_idx=? and g_name=?', [number, results[0].s_idx, g_name], function (e, result) {
                if (e) { console.log(e); }
                else {
                    var str = '(' + s_name + ')' + g_name;
                    for (var id in cart) {
                        if (id == str) {
                            cart[id] = 0;
                            response.cookie('cart', cart);
                        }
                    }
                }
            });
        }
    });
})

app.get('/getAccount', function (request, response) {
    var s_name = request.query.s_name;
    var g_name = request.query.g_name;

    connection.query('SELECT * from stores, goods where s_name=? and g_name=? and s_idx=g_s_idx', [s_name, g_name], function (error, result) {
        if (error) { console.log(error); }
        else {
            response.send({ result: result[0].g_account });
        }
    })
})

app.post('/delete_cart', function (request, response) {
    var g_name = request.body.g_name;
    var s_name = request.body.s_name;
    var number = request.body.number;
    var cart = request.cookies.cart;
    var str = '(' + s_name + ')' + g_name;

    for (var id in cart) {
        if (id == str) {
            cart[id] = 0;
            response.cookie('cart', cart);
        }
    }

    response.redirect('/Cart');
})

app.get('/add_cookie', function (request, response) {

    var s_name = request.query.ss_name;
    var g_name = request.query.gg_name;
    var number = request.query.number;
    var str = '(' + s_name + ')' + g_name;

    if (request.cookies.cart) {
        var cart = request.cookies.cart;
    }
    else {
        var cart = {};
    }
    if (!cart[str]) {
        cart[str] = 0;
    }
    cart[str] = parseInt(cart[str]) + parseInt(number);

    response.cookie('cart', cart);

    response.send('<script type="text/javascript">alert("장바구니에 담겼습니다."); window.close(); </script>');

});

var idList = [];
var userList = [];

io.on('connection', function (socket) {

    socket.on('SEND', function (data) {
        if (data.login_mode == "1") {
            io.to(idList[data.target]).emit('SEND', { msg: data.msg, username: data.username });
        }
        else if (data.login_mode == "2") {
            if (data.msg[0] == '(') {
                var index = data.msg.indexOf(')');
                var target = data.msg.substring(1, index);
                var newMsg = data.msg.substring(index + 1, data.msg.length);

                io.to(idList[target]).emit('SEND', { msg: newMsg, username: data.username });
            }
            else {
                var str = '"(고객이름)메세지"로 입력해야 전달됩니다.'
                io.to(idList[data.username]).emit('enter', { msg: str });
            }
        }
    });

    socket.on('disconnect', function () {
        var index = userList.indexOf(socket.username);
        userList.splice(index, 1);

        io.emit('enter', { msg: socket.username + '님이 나갔습니다.' });
    });

    socket.on('add user', function (username) {
        idList[username] = socket.id;
        socket.username = username;
        userList.push(username);

        io.emit('enter', { msg: socket.username + '님이 들어왔습니다.' });

    });

    socket.on('market user', function (data) {
        if (data.login_mode == "2") {
            var str = '"(고객이름)메세지"로 입력하면 고객에게 메세지를 전달할 수 있습니다. 문의에 답변해보세요.';
            io.to(idList[data.username]).emit('enter', { msg: str });
        }
        else if (data.login_mode == "1") {
            console.log(data.market);
            var str = '안녕하세요 ' + data.market + '입니다:) 문의 주시면 답변 드리겠습니다.';
            io.to(idList[socket.username]).emit('user_enter', { msg: str, market: data.market });
        }
    });

});
app.get('/guide', function (request, response) {
    response.render('guide');
})
app.get('/barcode', function (request, response) {
    response.render('barcodeTest');
});

app.use(function (req, res, next) {
    next(createError(404));
});
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
server.listen(5000, function () {
    console.log('Server On !');
});