const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const mongoConfig = require('./mongo-config.json')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

const dbUrl = mongoConfig.dbUrl;

var Message = mongoose.model('Message', {
    name: String,
    message: String
})


app.get('/messages', (req, res) =>{
    Message.find({}, ((error, message) => {
        if(error){
            console.error(error)
        }
        res.send(message)
    }))
})

app.post('/messages', (req, res) =>{
    var message = new Message(req.body)

    message.save((err) => {
        if(err){
            res.sendStatus(500)
        } else {
            io.emit('message', req.body)
            res.sendStatus(200)
        }
    })


})

io.on('connection', (socket) => {
    console.log('A user connected')
})

mongoose.connect(dbUrl, (err) => {
    if(err){
        console.error(err)
    } else {
        console.log('Connected to MongoDB')
    }
})

const server = http.listen(3000, () => {
    console.log('Server is listening on port', server.address().port)
})