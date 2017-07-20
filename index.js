var app = require('express')()
var config = require('./config.js')
var dataset = require('./db/staticdata.js')
var Queue = require('./queue.js')
var Helpers = require('./Helpers.js')

var bodyParser = require('body-parser')

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: false}))

var http = require('http').Server(app)

var io = require('socket.io')(http)

io.set('heartbeat interval', 10000)
io.set('heartbeat timeout', 30000)

http.listen(config.port, function () {
    console.log('listening on *:' + config.port)
})

dataset.All(init)

function init(labs) {

    for (var index in labs) {
        createLabRoom(labs[index])
    }

    setInterval(function () {
        for (var index in labs) {

            for (var ins_index in labs[index].instances) {

                if (!labs[index].instances[ins_index].maintenance)
                    Helpers.VerifyLabStatus(labs[index].instances[ins_index])
            }
        }

    }, config.labVerifyInterval * 60 * 1000)

    setInterval(function () {
        Helpers.LabsReport()
    }, config.reportInterval * 60 * 1000)

    app.post('/auth', function (req, res) {
        Helpers.authorization(req, res, labs)
    })

    app.get('/auth', function (req, res) {
        res.send('Ok')
    })

}

/* 
 var obj = {
 js: String,
 css: String,
 html: String, 
 address: String
 }
 
 socket.emit('success', obj)
 
 socket.emit('err', null)
 
 socket.emit('wait', {n_wait: 1,
 clock: {
 min: 1,
 seg: 2}
 })
 
 socket.emit('status', null) */
function createLabRoom(lab) {
    lab.queue = new Queue(lab.duration * 60, lab)
    var nsp = io.of(lab.id)
    nsp.setMaxListeners(config.maxListeners)

    // URL para conexão deve conter o id do laboratório, por exemplo relle.ufsc.br:8080/7 para Laboratório com ID 7

    lab.queue.bindFunction({
        first: first,
        wait: wait,
        leave: leave,
        //extended: extended,
        status: status
    })

    nsp.on('connection', function (socket) {
        labAux = lab.id;  
        socket.activeUser = false
        console.log('new user on lab ' + lab.id + ' id: ' + socket.id)
        
        socket.on('new connection', function (data) {
            console.log(data)  
            
            /*----------------- Token verificação---------------- */
            if (typeof (data.token) != 'undefined' && data.token>0 ) {
                Helpers.verifyBookingToken(lab.id,data.token, function () {
                    if (!lab.queue.isOnQueue(data.pass)) {
                        socket.pass = data.pass
                        socket.activeUser = true
                        lab.queue.unshift(socket)
                        }                        
                    }, function () {
                        socket.emit('err', {
                            code: 1,
                            message: 'Missing booking token'
                        })
                        
                    });

            }else if ((data.token).length > 0 && !(data.token>0)) {
                        socket.emit('err', {
                            code: 1,
                            message: 'Missing booking token'
                        })
                
            }else if (typeof (data.pass) == 'undefined') {
                socket.emit('err', {
                    code: 2,
                    message: 'Missing session token'
                })

            } else if (!lab.queue.isOnQueue(data.pass)) {
                //autenticação
                socket.pass = data.pass
                socket.activeUser = true
                lab.queue.push(socket)

            } else {
                socket.emit('err', {
                    code: 3,
                    message: 'Socket is already on queue'
                })

            }

        })

        socket.on('reconnection', function (data) {

            if (typeof (data.pass) == 'undefined') {
                socket.emit('err', {
                    code: 1,
                    message: 'Missing token'
                })

            } else {
                //autenticação
                socket.pass = data.pass
                socket.activeUser = true
                if (!lab.queue.replaceOnQueue(socket)) {

                    socket.emit('err', {
                        code: 2,
                        message: 'Socket not found on queue'
                    })

                } else {

                    console.log(socket.id + ' was replaced on queue')
                    socket.emit('reconnected session', null)

                }
            }
        })

        socket.on('leave', function () {
            if (socket.activeUser) {
                lab.queue.remove(socket, null, null)
            }
            console.log('user disconnected')
        })

        socket.on('disconnect', function () {
            if (socket.activeUser) {
                lab.queue.remove(socket, null, null)
            }
            console.log(socket.activeUser + 'user disconnected' + ' id: ' + socket.id)
        })
    })
}

function wait(socket, time, queue_len, instance_len) {        
    var obj = {}
    obj.clock = Helpers.formatTime(time)
    obj.wait = queue_len
    obj.ninstances = instance_len
    Helpers.verifyNotice(labAux,function(){
            obj.infor = true;
            socket.emit('wait', obj)
                console.log(obj)
        }, function(){
            obj.infor = false;
            socket.emit('wait', obj)
                console.log(obj)
        })
}

function status(socket, time, queue_len) {
    var obj = {}
    obj.clock = Helpers.formatTime(time)
    obj.wait = queue_len
    console.log(obj)
    socket.emit('status', obj)
}

function extended(socket, lab_instance) {
    socket.emit('extended session', null)
    // TODO conceder pedaços de tempo pequenos (30s, por exemplo)
    // TODO testar e documentar a a configuração de fila estendida opcional
}

function first(socket, lab_instance) {
    var path = config.sitePath + "/" + lab_instance.lab_id + "/" + lab_instance.id + "/"
    var obj = {
        js: path + config.scriptFile,
        css: path + config.styleFile,
        defaulthtml: path + config.default_html,
        en: path + config.en_html,
        pt: path + config.pt_html,
        es: path + config.es_html,
        address: lab_instance.address.trim(),
        instance_id: lab_instance.id
    }

    if (typeof (lab_instance.defaulthtml) !== "undefined") {
        if (lab_instance.defaulthtml.length > 0) {
            obj.js = lab_instance.js.trim()
            obj.css = lab_instance.css.trim()
            obj.defaulthtml = lab_instance.defaulthtml.trim()
            obj.en = lab_instance.en.trim()
            obj.pt = lab_instance.pt.trim()
            obj.es = lab_instance.es.trim()
        }
    }

    obj.clock = {}
    obj.clock.min = lab.duration
    obj.clock.seg = 0
    console.log(obj);
    socket.emit('success', obj)
}

function leave(socket, lab_instance) {
    socket.emit('finished session', null)
}
