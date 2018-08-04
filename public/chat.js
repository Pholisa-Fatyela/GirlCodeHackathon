const socket = io.connect();

let loginBtn = document.querySelector('.loginBtn');
let chatBtn = document.querySelector('.chatBtn');
let chatMessage = document.querySelector('.chatMessage');
let loginSection = document.querySelector('.loginSection');
let usernameElem = document.querySelector('.username');
let messages = document.querySelector('.messages');

let username;

socket.on('msg', function (msg) {
    messages.innerHTML += '<li>' + msg + '</li>';
});

function login (data) {
    socket.emit('login', data);
}

function chat (msg) {
    socket.emit('chat', username + ':' + msg);
}

loginBtn.addEventListener('click', function () {

    if (usernameElem.value.trim().length === 0) {
        return;
    }

    loginSection.classList.add('hidden');

    username = usernameElem.value;
    login({
        username
    });
});

chatBtn.addEventListener('click', function () {
    if (chatMessage && chatMessage.value.trim().length > 0) {
        chat(chatMessage.value);
        chatMessage.value = '';
    }
});
