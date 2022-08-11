const mongoose = require('mongoose')

const UserMessageSchema =new mongoose.Schema({

    content:String,
    from:Object,
    socketid: String,
    time: String,
    date: String,
    to: String

})

const Message = mongoose.model('Message', UserMessageSchema)

module.exports = Message