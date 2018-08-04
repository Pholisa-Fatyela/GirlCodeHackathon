const socket = io.connect();

let usernameElem = document.querySelector('.username');
let messages = document.querySelector('.messages');

socket.on('chat-log', function(chatLog) {
    messages.innerHTML = '';
    let logList = chatLog.map(function(chat) {
        return '<li>' + chat + '</li>';
    });
    messages.innerHTML = logList;
});

socket.on('new-user', function (userdata) {

});

function chatWith (username) {
    usernameElem.innerHTML = username;

    socket.emit('get-chat-log', {
        username
    });
}
