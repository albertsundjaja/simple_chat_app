const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const http = require('http').Server(app);

// io handler, also enable cors
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 8080;

// storage for messages, only store 20 max
let messageHistory = [];
// storage for connected users
let users = [];

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        let disconnectedUserIdx = users.findIndex((user) => user.id == socket.id);
        let disconnectedUser = users[disconnectedUserIdx];
        users.splice(disconnectedUserIdx, 1);

        socket.broadcast.emit("userDisconnected", {disconnected: disconnectedUser, newUsers: users});
    })

    // handle user registration (username)
    socket.on('register', data => {
        let newUser = {id: socket.id, ...data};
        users.push(newUser);

        io.emit("userConnected", {connected: newUser, newUsers: users});
    })

    // handle new message from users
    socket.on('newMessage', data => {
        let sendingUser = users.find((user) => user.id == socket.id);
        messageHistory.push({username: sendingUser.username, ...data})
        // remove first element if history is more than 20
        if (messageHistory.length > 20) {
            messageHistory.shift();
        }
        io.emit("updateMessage", messageHistory);
    })

    // send messageHistory to sender
    socket.on("getHistory", () => {
        io.to(socket.id).emit("updateMessage", messageHistory);
    })

    // send users to sender
    socket.on("getUsers", () => {
        io.to(socket.id).emit("updateUsers", users);
    })
})


http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})