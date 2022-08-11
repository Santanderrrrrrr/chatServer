const express = require('express');
const cors = require('cors');

const mongoose = require('./mongoose/mongoose')
const userRoutes = require('./mongoose/routes/userRoutes')
const User = require('./mongoose/models/userModel')
const message = require('./mongoose/models/messageModel')

const funcs = require('./utils/functionsEtc')

const app = express();

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

app.use('/users',userRoutes)


mongoose._connect()

const rooms = ['general', 'tech', 'finance', 'crypto']





// app.listen(3005, ()=>{
//     console.log('app listening on http://localhost:3005')
// })

const server = require('http').createServer(app)
const PORT = 3006
const io = require('socket.io')(server, {
    cors:{
        origin:'http://localhost:3000',
        // origin: '*',
        methods: ['GET', 'POST']
    }
})




app.get('/rooms', (req, res)=>{
    res.json(rooms)
})

//socket connection
io.on('connection', (socket)=>{
    console.log(`user connected on: ${socket.id}`)
    socket.on('new-user', async ()=>{
        console.log('now executing find.')
        const members = await User.find({})
        io.emit('new-user', members)
    })
    socket.on('join-room', async(newRoom, previousRoom)=>{
        socket.join(newRoom)
        console.log("user is leaving room"+ previousRoom)
        socket.leave(previousRoom)
        let roomMessages = await funcs.getLastMessagesFromRoom(newRoom)
        roomMessages=funcs.sortRoomMessagesByDate(roomMessages)
        socket.emit('room-messages', roomMessages)
        console.log("Messages to "+ newRoom + " emitted")
    })

    socket.on('message-room', async (room, content, sender, time, date)=>{
        console.log(`new message: ${content}`)
        const newMessage = await message.create({content, from: sender, time, date, to: room})
        let roomMessages = await funcs.getLastMessagesFromRoom(room)

        roomMessages = await funcs.sortRoomMessagesByDate(roomMessages)
        
        //sending message to room
        
        await io.to(room).emit('room-messages', roomMessages)
        
        // console.log(roomMessages[0][Object.keys(roomMessages[0])[1]])
        // console.log(roomMessages)
        // console.log(socket.id)
        
        socket.broadcast.emit('notifications', room)
    })

    app.delete('/logout', async(req, res)=>{
        try{
            const{_id, newMessages} = req.body
            let thisUser = await User.findById(_id)
            thisUser.status = "offline"
            thisUser.newMessages = newMessages
            await thisUser.save()
            // console.log(thisUser.status)
            // const thisUserAgain = User.findById(_id)
            // console.log(thisUserAgain.status)
            const members = await User.find({})
            socket.broadcast.emit('new-user', members)
            res.status(200).send()
        }
        catch(e){
            console.log(e.message)
            res.status(400).send()
        }
    })
})

server.listen(PORT, ()=>{
    console.log(`app listening on http://localhost:${PORT}`)
})