const { createServer } = require('http')
const { Server, Socket } = require('socket.io');

const serverPeices = [
	['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
	['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
	['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
]

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

    socket.emit('init board', serverPeices)

    socket.on('move', ([prev, next]) => {
        console.log({ prev, next});
        const [xNext, yNext] = next
        const [xPrev, yPrev] = prev

        serverPeices[yNext][xNext] = serverPeices[yPrev][xPrev]
        serverPeices[yPrev][xPrev] = null
        io.emit('move', [prev, next])
    })

    socket.on('test', () => {
        console.log('test');
    })
})

// Server
httpServer.listen(5000)
