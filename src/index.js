const { createServer } = require('http')
const { Server, Socket } = require('socket.io');


const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:5000'],
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    console.log('Socket connected');
    socket.emit('connected', 'hello from sockets')
})

// Server
httpServer.listen(5000)
