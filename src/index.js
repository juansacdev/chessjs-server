const { createServer } = require('http')
const { Server, Socket } = require('socket.io');

const initialBoard = [
	['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
	['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
	['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
]

const rooms = {}

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:5000'],
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {
    console.log('Socket connected');
    socket.emit('connected')

    socket.on('join room', (roomId)=> {
        socket.roomId = roomId

        if (!rooms[roomId]) {
            rooms[roomId] = {
                board: JSON.parse(JSON.stringify(initialBoard)),
                players: [],
                current: 0,
            }
        }

        if (rooms[roomId].players.length >= 2) {
            socket.emit('room full')
            return
        }

        rooms[roomId].players.push(socket)
        socket.join(roomId)

        socket.emit('init board',  rooms[roomId].board)

        if (rooms[roomId].players.length === 2) {
            const { players } = rooms[roomId]
            if (Math.random() > 0.5) {
               rooms[roomId].current = 1
               players[1].emit('white Turn')
               players[0].emit('black Turn')
            } else {
                players[0].emit('white Turn')
                players[1].emit('black Turn')
            }
        }
    })


    socket.on('move', ([prev, next]) => {
        const { roomId } = socket
        if (!roomId) return

        const room = rooms[roomId]
        const [xNext, yNext] = next
        const [xPrev, yPrev] = prev

       if (!room) {
            return
        }

        room.board[yNext][xNext] = room.board[yPrev][xPrev]
        room.board[yPrev][xPrev] = null

        io.to(roomId).emit('move', [prev, next])

        room.current = room.current ? 0 : 1

        room.players[room.current].emit('white Turn')
    })

    socket.on('disconnecting', () => {
        const socketRooms = [...socket.rooms]
        socketRooms.forEach(room => {
            if (!rooms[room]) return
            rooms[room].players = rooms[room].players.filter(player => player !== socket)
            io.to(room).emit('player left')
        })
    })
})

// Server
httpServer.listen(5000)
