const { Server } = require('socket.io');

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000',
    },
})

io.on('connection', (socket) => {
    console.log('Connected with id ', socket.id);

    socket.on('send-location', (data) => {
        io.emit('recieve-location', { id: socket.id, ...data })
    })

    socket.on('diconnected', () => {
        io.emit('user-disconnected', socket.id)
    })
})