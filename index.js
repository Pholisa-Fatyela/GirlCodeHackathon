const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ChatManager = require('./chat-manager');

app.use(express.static('public'));

const chats = ChatManager();
let dashboardSocketId;

io.on('connection', function (client) {
    function sendTo (socketId, msg) {
        // record the chat message 
        chats.logMessage(socketId, msg);
        // send the message back to the user
        io.to(socketId).emit('msg', msg);
        // send the message to the dashboard
        io.to(dashboardSocketId).emit('msg', {
            username: chats.getUserName(socketId),
            message: msg
        });
    }

    client.on('chat', function (msg) {
        sendTo(client.id, msg);
    });

    // when the dashboard user chat to a user
    client.on('chat-to', function (chatMessage) {
        let username = chatMessage.username;
        let message = chatMessage.message;
        let socketId = chats.getSocketId(username);

        sendTo(socketId, message);
    });

    // send a chat history list to a user
    client.on('get-chat-log', function (chatMessage) {
        let username = chatMessage.username;
        let chatLog = chats.chatLogForUserName(username);
        io.to(client.id).emit('chat-log', chatLog);
    });

    // a new chat user login
    client.on('login', function (userData) {
        chats.login(client.id, userData);
        // get a chat log for the user who is loggin in
        let chatLog = chats.chatLog(client.id);
        // send the chat log to the user that is logging in
        io.to(client.id).emit('login-response', chatLog);
        // tell the dashboard there is a new user
        io.to(dashboardSocketId).emit('new-user', userData.username);
        // send a default message when a user login
        let msg = 'Admin: Hi, ' + userData.username + '! How can we help?';
        // send a message to a client
        sendTo(client.id, msg);
    });

    // capture the socketId of the dashboard screen
    client.on('dashboard', function () {
        dashboardSocketId = client.id;
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
