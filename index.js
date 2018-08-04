const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ChatManager = require('./chat-manager');

app.use(express.static('public'));

const chats = ChatManager();

io.on('connection', function (client) {
    function sendTo (socketId, msg) {
        chats.logMessage(socketId, msg);
        io.to(socketId).emit('msg', msg);
    }

    client.on('chat', function (msg) {
        sendTo(client.id, msg);
    });

    client.on('chat-to', function (chatMessage) {
        let username = chatMessage.username;
        let message = chatMessage.message;
        let socketId = chats.getSocketId(username);

        sendTo(socketId, message);
    });

    client.on('get-chat-log', function (chatMessage) {
        let username = chatMessage.username;
        let chatLog = chats.chatLogForUserName(username);
        io.to(client.id).emit('chat-log', chatLog);
    });

    client.on('login', function (userData) {
        chats.login(client.id, userData);
        let msg = 'Hi, ' + userData.username + '! How can we help?';
        sendTo(client.id, msg);
    });
});

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('chat');
});

app.get('/dashboard', function (req, res) {
    res.render('dashboard', { users: chats.chatList() });
});

server.listen(3010, function () {
    console.log('started on: ', this.address().port);
});
