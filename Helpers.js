var Client = require('node-rest-client').Client
var mysql = require('mysql')

var config = require('./config.js')

var connection = mysql.createConnection(config.dbconfig)



exports.authorization = function(req, res, labs){
     console.log(req.body)
     var payload = req.body
     var data = {}
     var lab = labs.filter(function (obj) { 
            return obj.id == payload.lab_id
        })[0]
    
    if(typeof(lab) === 'object'){
        if(lab.instances.length > 0){            
            var oinstance = lab.instances.filter(function (obj) { 
                return obj.secret == payload.instance_secret
            })[0]

            if( typeof(oinstance) === 'object' && oinstance.actual !== null ){
                if(oinstance.actual.pass == payload.token){
                    data = {duration: oinstance.duration, code: 200}
                }else{
                    data = {message: 'Token does not match with current token', code: 403}
                }

            }else{
                 data = {message: 'Instance not found', code: 404}
            }
            
        }else{
            data = {message: 'No lab available', code: 404}
        }
                
    } else{
        data = {message: 'Lab not found', code: 404}
    }
    
    res.send(data)
}



exports.formatTime = function(time) {
    var clock = {}
    clock.min = Math.floor(time / 60)
    clock.seg = Math.floor(time - clock.min * 60)
    return clock
}

exports.TimeWaiting = function(alab){
    var instances = alab.instances
     
    var min = new Date().getTime()
    
    for (lab of instances){
        if(lab.arrival_time != null && lab.arrival_time < min){
            min = lab.arrival_time
        }
            
    }
    console.log(new Date().getTime()/1000 - min/1000)
    
    return Math.floor((min/1000))
}

exports.InstanceAvailable = function(alab){
    var instances = alab.instances
    for (lab of instances){
        if(lab.isAvailable()){
            console.log('InstanceAvailable '+ lab.id + ' of lab ' + lab.lab_id)
            return lab
        }
    }
    return null
}

exports.VerifyLabStatus = function(lab, cb){
    
        var args = {
            requestConfig: {
                timeout: 5000, //request timeout in milliseconds
            },
            responseConfig: {
                timeout: 30000 //response timeout
            }
        }
        
        var client = new Client()
        var req = client.get('http://'+ lab.address , args, function (data, response) {

            lab.log(response.statusCode)

        })

        req.on('requestTimeout', function (req) {
            console.log("request has expired")
            req.abort()
            lab.log('requestTimeout')
        })

        req.on('responseTimeout', function (res) {
            lab.log('responseTimeout')
        })

        req.on('error', function (err) {
            lab.log(err.code)

        })
     

} 

var log = require('./log')

exports.LabsReport = function(time) {
    log.report(new Date() + ".json")
    log.clean()
}

exports.verifyBookingToken = function(expID, token, callback_pass, callback_failed) {
    //Excluindo agendamentos antigos
    var timesAtual = Math.round(new Date().getTime()/1000);
    connection.query("DELETE FROM `booking` WHERE `timestamp_left` < " + timesAtual, function () {
    });
    //Comparando o token
    connection.query("SELECT * FROM booking WHERE token =" + token + " AND (" + timesAtual + " BETWEEN timestamp_enter AND timestamp_left) AND "+expID+" = lab_id", function (result) {
        if(typeof(result) !== 'undefined' && result.length >0){
            callback_pass();
        }else{
                callback_failed();
        }
    });
};


exports.verifyNotice = function(expID, Npass, Nfail){
    var timesAtual = Math.round(new Date().getTime()/1000);
    connection.query("SELECT* FROM booking WHERE lab_id = "+expID+" AND ("+ timesAtual + " BETWEEN timestamp_enter AND timestamp_left)", function (err, result, fields){
        if(err)
            throw err;
        if(typeof(result) !== 'undefined' && result.length >0){
            Npass();
        }
        else{
            Nfail();
        }   
    });
};




